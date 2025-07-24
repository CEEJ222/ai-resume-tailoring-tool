import { useState, useCallback, useEffect } from 'react';
import { supabase, STORAGE_BUCKETS, TABLES } from '../lib/supabase';

const useSupabaseFileUpload = () => {
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // File type configurations
  const fileTypes = [
    { 
      type: 'resume', 
      label: 'Resume Versions', 
      accept: '.pdf,.doc,.docx',
      maxSize: 10 * 1024 * 1024, // 10MB
      description: 'Upload different versions of your resume for analysis and content extraction',
      bucket: STORAGE_BUCKETS.RESUMES
    },
    { 
      type: 'writing', 
      label: 'Writing Samples', 
      accept: '.pdf,.doc,.docx,.txt',
      maxSize: 15 * 1024 * 1024, // 15MB
      description: 'Product requirements, strategy docs, case studies, and other writing samples',
      bucket: STORAGE_BUCKETS.WRITING_SAMPLES
    },
    { 
      type: 'resource', 
      label: 'Resources', 
      accept: '.pdf,.doc,.docx,.xlsx,.ppt,.pptx',
      maxSize: 20 * 1024 * 1024, // 20MB
      description: 'Skills matrices, templates, certifications, and reference materials',
      bucket: STORAGE_BUCKETS.RESOURCES
    }
  ];

  // Load files from Supabase on component mount
  useEffect(() => {
    loadFiles();
  }, []);

  const loadFiles = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // Check if Supabase is configured
      if (!supabase) {
        console.log('Supabase not configured, no files to load');
        setUploadedFiles([]);
        return;
      }
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('No authenticated user, cannot load files');
        setUploadedFiles([]);
        return;
      }
      
      const userId = user.id;
      
      console.log('Loading files for user:', userId);

      // Fetch files from database
      const { data: files, error } = await supabase
        .from(TABLES.FILES)
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading files:', error);
        setUploadError('Failed to load files');
        setUploadedFiles([]);
        return;
      }

      console.log('Files loaded from database:', files);
      setUploadedFiles(files || []);
    } catch (error) {
      console.error('Error in loadFiles:', error);
      setUploadError('Failed to load files');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const validateFile = useCallback((file, fileType) => {
    const config = fileTypes.find(ft => ft.type === fileType);
    if (!config) {
      throw new Error('Invalid file type');
    }

    // Check file size
    if (file.size > config.maxSize) {
      throw new Error(`File size exceeds ${config.maxSize / (1024 * 1024)}MB limit`);
    }

    // Check file extension
    const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
    const acceptedExtensions = config.accept.split(',');
    if (!acceptedExtensions.includes(fileExtension)) {
      throw new Error(`File type ${fileExtension} not supported`);
    }

    return true;
  }, [fileTypes]);

  const formatFileSize = useCallback((bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }, []);

  const handleFileUpload = useCallback(async (event, fileType) => {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;

    console.log('File upload started:', { fileType, files: files.map(f => f.name) });

    setIsUploading(true);
    setUploadError(null);

    try {
      // Check if Supabase is configured
      if (!supabase) {
        console.log('Supabase not configured, cannot upload files');
        setUploadError('Supabase not configured. Please check your environment variables.');
        return;
      }

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('No authenticated user, cannot upload files');
        setUploadError('Please sign in to upload files');
        return;
      }
      
      const userId = user.id;

      const config = fileTypes.find(ft => ft.type === fileType);
      if (!config) {
        throw new Error('Invalid file type configuration');
      }

      for (const file of files) {
        console.log('Processing file:', file.name);
        
        // Validate file
        validateFile(file, fileType);

        // Upload file to Supabase Storage
        const fileName = `${Date.now()}-${file.name}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from(config.bucket)
          .upload(fileName, file);

        if (uploadError) {
          console.error('Storage upload error:', uploadError);
          throw new Error(`Failed to upload file: ${uploadError.message}`);
        }

        // Get public URL for the uploaded file
        const { data: { publicUrl } } = supabase.storage
          .from(config.bucket)
          .getPublicUrl(fileName);

        // Save file metadata to database
        const fileRecord = {
          name: file.name,
          type: fileType,
          size: formatFileSize(file.size),
          file_path: fileName,
          public_url: publicUrl,
          user_id: userId,
          upload_date: new Date().toISOString().split('T')[0]
        };

        // Always save to database (demo mode or authenticated)
        console.log('Attempting to save file record to database:', fileRecord);
        
        const { data: dbData, error: dbError } = await supabase
          .from(TABLES.FILES)
          .insert([fileRecord])
          .select()
          .single();

        if (dbError) {
          console.error('Database insert error:', dbError);
          console.error('Error details:', {
            message: dbError.message,
            details: dbError.details,
            hint: dbError.hint,
            code: dbError.code
          });
          throw new Error(`Failed to save file metadata: ${dbError.message}`);
        } else {
          console.log('File saved to database:', dbData);
          setUploadedFiles(prev => [dbData, ...prev]);
        }
      }
      
      // Clear the input
      event.target.value = '';
      
    } catch (error) {
      console.error('File upload error:', error);
      setUploadError(error.message);
    } finally {
      setIsUploading(false);
    }
  }, [fileTypes, validateFile, formatFileSize]);

  const removeFile = useCallback(async (fileId) => {
    console.log('Removing file with ID:', fileId);
    
    try {
      const fileToRemove = uploadedFiles.find(f => f.id === fileId);
      if (!fileToRemove) {
        console.error('File not found:', fileId);
        return;
      }

      console.log('Removing file:', fileToRemove.name);

      // Check if Supabase is configured
      if (!supabase) {
        console.log('Supabase not configured, removing from local state only');
        // Update local state
        setUploadedFiles(prev => {
          const updated = prev.filter(file => file.id !== fileId);
          console.log('Files after removal:', updated.map(f => f.name));
          return updated;
        });
        return;
      }

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user && fileToRemove.file_path) {
        // Remove from Supabase Storage
        const config = fileTypes.find(ft => ft.type === fileToRemove.type);
        if (config) {
          const { error: storageError } = await supabase.storage
            .from(config.bucket)
            .remove([fileToRemove.file_path]);

          if (storageError) {
            console.error('Storage removal error:', storageError);
          }
        }

        // Remove from database
        const { error: dbError } = await supabase
          .from(TABLES.FILES)
          .delete()
          .eq('id', fileId);

        if (dbError) {
          console.error('Database removal error:', dbError);
        }
      }

      // Update local state
      setUploadedFiles(prev => {
        const updated = prev.filter(file => file.id !== fileId);
        console.log('Files after removal:', updated.map(f => f.name));
        return updated;
      });

    } catch (error) {
      console.error('Error removing file:', error);
      setUploadError('Failed to remove file');
    }
  }, [uploadedFiles, fileTypes]);

  const getFilesByType = useCallback((fileType) => {
    return uploadedFiles.filter(file => file.type === fileType);
  }, [uploadedFiles]);

  const getUploadStats = useCallback(() => {
    return {
      total: uploadedFiles.length,
      resumes: getFilesByType('resume').length,
      writing: getFilesByType('writing').length,
      resources: getFilesByType('resource').length
    };
  }, [uploadedFiles, getFilesByType]);

  // Utility function to manually add a file (for debugging/testing)
  const addFileManually = useCallback(async (fileName, fileType, fileSize = '150 KB') => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.log('No authenticated user, cannot add file manually');
      return;
    }
    
    const newFile = {
      id: Date.now() + Math.random(),
      name: fileName,
      type: fileType,
      uploadDate: new Date().toISOString().split('T')[0],
      size: fileSize,
      status: 'uploaded',
      user_id: user.id
    };
    
    console.log('Manually adding file:', newFile);
    setUploadedFiles(prev => [newFile, ...prev]);
  }, []);

  return {
    uploadedFiles,
    isUploading,
    uploadError,
    isLoading,
    fileTypes,
    handleFileUpload,
    removeFile,
    getFilesByType,
    getUploadStats,
    clearError: () => setUploadError(null),
    addFileManually,
    loadFiles
  };
};

export default useSupabaseFileUpload; 