import React, { useCallback, useState } from 'react';
import { UploadCloud, AlertCircle, FileText, CheckCircle2 } from 'lucide-react';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileSelect }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragging(true);
    } else if (e.type === "dragleave") {
      setIsDragging(false);
    }
  }, []);

  const validateAndProcess = (file: File) => {
    const validTypes = [
      'application/pdf', 
      'application/vnd.ms-powerpoint', 
      'application/vnd.openxmlformats-officedocument.presentationml.presentation'
    ];
    
    const validExtensions = ['.pdf', '.ppt', '.pptx'];
    const hasValidExt = validExtensions.some(ext => file.name.toLowerCase().endsWith(ext));

    if (!validTypes.includes(file.type) && !hasValidExt) {
      setError("Please upload a PDF or PPT file.");
      return;
    }
    
    if (file.size > 20 * 1024 * 1024) {
      setError("File is too large (Max 20MB).");
      return;
    }
    setError(null);
    onFileSelect(file);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndProcess(e.dataTransfer.files[0]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndProcess(e.target.files[0]);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto relative group">
      {/* Background Soft Glow */}
      <div className={`absolute -inset-1 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-[2rem] blur opacity-30 group-hover:opacity-60 transition duration-500 ${isDragging ? 'opacity-80 scale-105' : ''}`}></div>
      
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`
          relative bg-slate-900/90 backdrop-blur-xl
          border-2 border-dashed rounded-[1.8rem] p-12
          flex flex-col items-center justify-center text-center
          transition-all duration-300 ease-in-out cursor-pointer
          ${isDragging 
            ? 'border-cyan-400 bg-slate-800/90' 
            : 'border-slate-700 hover:border-cyan-400/50'
          }
        `}
      >
        <input
          type="file"
          accept=".pdf,.ppt,.pptx,application/pdf,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation"
          onChange={handleChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
        />
        
        <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 transition-all duration-300 ${isDragging ? 'bg-cyan-500 text-white scale-110 shadow-lg shadow-cyan-500/50' : 'bg-slate-800 text-cyan-400 group-hover:bg-cyan-500 group-hover:text-white'}`}>
          <UploadCloud size={36} strokeWidth={2} />
        </div>
        
        <h3 className="text-2xl font-bold text-white mb-2">
          Upload PDF or PPT
        </h3>
        <p className="text-slate-400 mb-8 max-w-xs mx-auto text-sm">
          Drag & drop your file here, or click to browse.
        </p>
        
        <div className="flex items-center space-x-2 text-xs font-medium text-slate-500 bg-slate-950/50 px-4 py-2 rounded-full border border-slate-800">
          <FileText size={14} className="text-blue-400" />
          <span>Max file size: 20MB</span>
        </div>
      </div>

      {error && (
        <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl flex items-center justify-center animate-pulse text-sm font-medium">
          <AlertCircle size={18} className="mr-2" />
          {error}
        </div>
      )}
    </div>
  );
};

export default FileUpload;