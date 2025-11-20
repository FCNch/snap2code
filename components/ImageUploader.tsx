import React, { useRef, useState } from 'react';
import { ImageFile } from '../types';
import { Button } from './Button';

interface ImageUploaderProps {
  onImageSelect: (image: ImageFile) => void;
  selectedImage: ImageFile | null;
  onReset: () => void;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageSelect, selectedImage, onReset }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      // Extract pure base64 for Gemini API (remove data:image/xyz;base64, prefix)
      const base64 = result.split(',')[1];
      
      onImageSelect({
        file,
        previewUrl: result,
        base64,
        mimeType: file.type
      });
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  if (selectedImage) {
    return (
      <div className="relative w-full h-full min-h-[300px] bg-slate-800 rounded-xl overflow-hidden shadow-2xl border border-slate-700 flex flex-col">
        <div className="absolute top-4 right-4 z-10">
          <Button variant="secondary" onClick={onReset} className="bg-slate-900/80 backdrop-blur-sm hover:bg-slate-900">
            Change Image
          </Button>
        </div>
        <div className="flex-1 relative bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]">
            <img 
              src={selectedImage.previewUrl} 
              alt="Upload Preview" 
              className="w-full h-full object-contain p-4" 
            />
        </div>
        <div className="p-3 bg-slate-900 border-t border-slate-700 flex justify-between items-center">
          <span className="text-xs text-slate-400 truncate max-w-[200px]">
            {selectedImage.file.name}
          </span>
          <span className="text-xs text-slate-500">
            {(selectedImage.file.size / 1024).toFixed(1)} KB
          </span>
        </div>
      </div>
    );
  }

  return (
    <div 
      onClick={() => inputRef.current?.click()}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`
        w-full h-full min-h-[400px] flex flex-col items-center justify-center
        border-2 border-dashed rounded-xl cursor-pointer transition-all duration-300
        ${isDragging 
          ? 'border-blue-500 bg-blue-500/10' 
          : 'border-slate-600 hover:border-slate-500 hover:bg-slate-800/50'
        }
      `}
    >
      <input 
        type="file" 
        ref={inputRef} 
        onChange={handleFileChange} 
        accept="image/*" 
        className="hidden" 
      />
      
      <div className="flex flex-col items-center p-8 text-center space-y-4">
        <div className={`p-4 rounded-full ${isDragging ? 'bg-blue-500/20 text-blue-400' : 'bg-slate-800 text-slate-400'}`}>
          <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <div>
          <p className="text-lg font-medium text-slate-200">
            Click or drag image here
          </p>
          <p className="text-sm text-slate-500 mt-1">
            Supports JPG, PNG, WebP (Max 5MB)
          </p>
        </div>
        <Button variant="outline" className="mt-4 pointer-events-none">
          Browse Files
        </Button>
      </div>
    </div>
  );
};
