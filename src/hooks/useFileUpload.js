import { useState, useCallback } from 'react';

const useFileUpload = () => {
  const [uploadedFiles, setUploadedFiles] = useState([
    { id: 1, name: 'C.Britz Resume - Disney, CRM.pdf', type: 'resume', uploadDate: '2024-01-15', size: '124 KB' },
    { id: 2, name: 'TruConnect Product Strategy.docx', type: 'writing', uploadDate: '2024-01-10', size: '89 KB' },
    { id: 3, name: 'PM Skills Matrix.xlsx', type: 'resource', uploadDate: '2024-01-08', size: '45 KB' }
  ]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);

  // File type configurations
  const fileTypes = [
    { 
      type: 'resume', 
      label: 'Resume Versions', 
      accept: '.pdf,.doc,.docx',
      maxSize: 10 * 1024 * 1024, // 10MB
      description: 'Upload different versions of your resume for analysis and content extraction'
    },
    { 
      type: 'writing', 
      label: 'Writing Samples', 
      accept: '.pdf,.doc,.docx,.txt',
      maxSize: 15 * 1024 * 1024, // 15MB
      description: 'Product requirements, strategy docs, case studies, and other writing samples'
    },
    { 
      type: 'resource', 
      label: 'Resources', 
      accept: '.pdf,.doc,.docx,.xlsx,.ppt,.pptx',
      maxSize: 20 * 1024 * 1024, // 20MB
      description: 'Skills matrices, templates, certifications, and reference materials'
    }
  ];

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
      const newFiles = [];

      for (const file of files) {
        console.log('Processing file:', file.name);
        
        // Validate file
        validateFile(file, fileType);

        // Simulate file processing (in real app, this would upload to server)
        await new Promise(resolve => setTimeout(resolve, 500));

        const newFile = {
          id: Date.now() + Math.random(),
          name: file.name,
          type: fileType,
          uploadDate: new Date().toISOString().split('T')[0],
          size: formatFileSize(file.size),
          file: file,
          status: 'uploaded'
        };

        console.log('Created new file object:', newFile);
        newFiles.push(newFile);
      }

      setUploadedFiles(prev => {
        const updated = [...prev, ...newFiles];
        console.log('Updated uploaded files:', updated.map(f => f.name));
        return updated;
      });
      
      // Clear the input
      event.target.value = '';
      
    } catch (error) {
      console.error('File upload error:', error);
      setUploadError(error.message);
    } finally {
      setIsUploading(false);
    }
  }, [validateFile, formatFileSize]);

  const removeFile = useCallback((fileId) => {
    console.log('Removing file with ID:', fileId);
    setUploadedFiles(prev => {
      const fileToRemove = prev.find(f => f.id === fileId);
      if (fileToRemove) {
        console.log('Removing file:', fileToRemove.name);
      }
      const updated = prev.filter(file => file.id !== fileId);
      console.log('Files after removal:', updated.map(f => f.name));
      return updated;
    });
  }, []);

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
  const addFileManually = useCallback((fileName, fileType, fileSize = '150 KB') => {
    const newFile = {
      id: Date.now() + Math.random(),
      name: fileName,
      type: fileType,
      uploadDate: new Date().toISOString().split('T')[0],
      size: fileSize,
      status: 'uploaded'
    };
    
    console.log('Manually adding file:', newFile);
    setUploadedFiles(prev => [...prev, newFile]);
  }, []);

  return {
    uploadedFiles,
    isUploading,
    uploadError,
    fileTypes,
    handleFileUpload,
    removeFile,
    getFilesByType,
    getUploadStats,
    clearError: () => setUploadError(null),
    addFileManually
  };
};

export default useFileUpload;
