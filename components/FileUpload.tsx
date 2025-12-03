import React, { useCallback, useState } from 'react';
import { Upload, FileText, AlertCircle } from 'lucide-react';
import { FileData } from '../types';

interface FileUploadProps {
  onFileSelect: (file: FileData) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileSelect }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const processFile = (file: File) => {
    setError(null);
    
    // Validate type
    const validTypes = ['application/pdf', 'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation'];
    if (!validTypes.includes(file.type)) {
      setError("Please upload a PDF or PowerPoint file.");
      return;
    }

    // Validate size (limit to 10MB for base64 safety)
    if (file.size > 10 * 1024 * 1024) {
      setError("File size exceeds 10MB limit.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const base64String = (reader.result as string).split(',')[1];
      onFileSelect({
        name: file.name,
        type: file.type,
        base64: base64String
      });
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div
        className={`
          relative group cursor-pointer
          glass-panel rounded-2xl p-10
          border-2 border-dashed transition-all duration-300
          flex flex-col items-center justify-center text-center
          ${isDragging 
            ? 'border-cyan-400 bg-cyan-900/20' 
            : 'border-slate-600 hover:border-cyan-400/50 hover:bg-slate-800/60'}
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          type="file"
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          onChange={handleInputChange}
          accept=".pdf,.ppt,.pptx"
        />
        
        <div className="mb-6 relative">
          <div className={`absolute inset-0 bg-cyan-500 blur-xl opacity-20 rounded-full transition-opacity duration-500 ${isDragging ? 'opacity-40' : ''}`} />
          <div className="relative bg-slate-800 p-4 rounded-full border border-slate-700">
            <Upload className={`w-10 h-10 ${isDragging ? 'text-cyan-400' : 'text-slate-400'}`} />
          </div>
        </div>

        <h3 className="text-xl font-semibold mb-2 text-slate-200">
          Upload your Lesson Material
        </h3>
        <p className="text-slate-400 mb-6 max-w-sm">
          Drag & drop your PDF or PowerPoint here, or click to browse.
        </p>
        
        <div className="flex gap-4 text-xs text-slate-500 font-mono">
          <span className="flex items-center gap-1"><FileText className="w-3 h-3" /> PDF</span>
          <span className="flex items-center gap-1"><FileText className="w-3 h-3" /> PPT/PPTX</span>
        </div>

        {error && (
          <div className="absolute -bottom-16 left-0 right-0">
             <div className="inline-flex items-center gap-2 text-red-400 bg-red-900/20 px-4 py-2 rounded-lg border border-red-900/50">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm">{error}</span>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FileUpload;