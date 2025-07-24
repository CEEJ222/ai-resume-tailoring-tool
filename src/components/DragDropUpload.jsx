import React, { useState, useRef } from 'react';
import { Upload, FileText, BookOpen, Briefcase } from 'lucide-react';

const DragDropUpload = ({ fileType, onUpload, isUploading, accept, maxSize, compact = false }) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [dragError, setDragError] = useState(null);
  const fileInputRef = useRef(null);

  const getIcon = () => {
    switch (fileType) {
      case 'resume': return FileText;
      case 'writing': return BookOpen;
      case 'resource': return Briefcase;
      default: return Upload;
    }
  };

  const validateFile = (file) => {
    // Check file size
    if (file.size > maxSize) {
      throw new Error(`File size exceeds ${maxSize / (1024 * 1024)}MB limit`);
    }

    // Check file extension
    const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
    const acceptedExtensions = accept.split(',');
    if (!acceptedExtensions.includes(fileExtension)) {
      throw new Error(`File type ${fileExtension} not supported`);
    }

    return true;
  };

  const handleFiles = (files) => {
    setDragError(null);
    
    try {
      const validFiles = Array.from(files).filter(file => {
        try {
          validateFile(file);
          return true;
        } catch (error) {
          setDragError(error.message);
          return false;
        }
      });

      if (validFiles.length > 0) {
        // Create a synthetic event object
        const event = {
          target: {
            files: validFiles
          }
        };
        onUpload(event, fileType);
      }
    } catch (error) {
      setDragError(error.message);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = e.dataTransfer.files;
    handleFiles(files);
  };

  const handleClick = () => {
    if (!isUploading) {
      fileInputRef.current?.click();
    }
  };

  const Icon = getIcon();

  return (
    <div className="relative">
      <div
        className={`border-2 border-dashed rounded-lg text-center transition-colors cursor-pointer ${
          compact 
            ? 'p-4' 
            : 'p-8'
        } ${
          isDragOver 
            ? 'border-blue-400 bg-blue-50' 
            : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
        } ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <Icon className={`mx-auto mb-2 ${
          compact 
            ? 'w-8 h-8' 
            : 'w-12 h-12 mb-4'
        } ${
          isDragOver ? 'text-blue-600' : 'text-gray-400'
        }`} />
        
        {isUploading ? (
          <div className="space-y-2">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600">Uploading...</p>
          </div>
        ) : (
          <div className="space-y-2">
            {compact ? (
              <>
                <p className="text-sm text-gray-600 mb-1">
                  Add another {fileType === 'resume' ? 'resume version' : 
                              fileType === 'writing' ? 'writing sample' : 
                              'resource'}
                </p>
                <p className="text-xs text-gray-500">
                  Drag & drop or <span className="text-blue-600 hover:text-blue-800">browse files</span>
                </p>
              </>
            ) : (
              <>
                <p className="text-lg font-medium text-gray-700">
                  {isDragOver ? 'Drop files here' : 'Drag & drop files here'}
                </p>
                <p className="text-sm text-gray-500">
                  or <span className="text-blue-600 hover:text-blue-800">browse files</span>
                </p>
                <p className="text-xs text-gray-400">
                  Accepted: {accept} • Max size: {maxSize / (1024 * 1024)}MB
                </p>
              </>
            )}
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={accept}
          onChange={(e) => onUpload(e, fileType)}
          className="hidden"
          disabled={isUploading}
        />
      </div>

      {dragError && (
        <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
          {dragError}
        </div>
      )}
    </div>
  );
};

export default DragDropUpload; 