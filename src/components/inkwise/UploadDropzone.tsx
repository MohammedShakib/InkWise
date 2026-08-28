"use client";

import { useCallback, useState } from 'react';
import { UploadCloud, FileImage } from 'lucide-react';
import { useInkWise } from '../../lib/store/InkWiseContext';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export default function UploadDropzone({ className }: { className?: string }) {
  const { addImages } = useInkWise();
  const [isDragging, setIsDragging] = useState(false);

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);
      
      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        const files = Array.from(e.dataTransfer.files).filter(file => 
          file.type.startsWith('image/png') || 
          file.type.startsWith('image/jpeg') || 
          file.type.startsWith('image/webp')
        );
        if (files.length > 0) addImages(files);
      }
    },
    [addImages]
  );

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        const files = Array.from(e.target.files);
        addImages(files);
      }
    },
    [addImages]
  );

  return (
    <div
      className={twMerge(
        clsx(
          "relative flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-2xl transition-all",
          isDragging 
            ? "border-emerald-500 bg-emerald-50/50" 
            : "border-gray-200 bg-gray-50 hover:bg-gray-100 hover:border-gray-300"
        ),
        className
      )}
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
    >
      <input
        type="file"
        multiple
        accept="image/png, image/jpeg, image/webp"
        onChange={handleFileChange}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        title="Upload images"
      />
      <div className="bg-white p-4 rounded-full shadow-sm mb-4 border border-gray-100">
        <UploadCloud className="w-8 h-8 text-emerald-600" />
      </div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">Drop your images here</h3>
      <p className="text-gray-500 mb-6">or click to browse files</p>
      
      <div className="flex items-center space-x-4 text-xs font-medium text-gray-400">
        <span className="flex items-center"><FileImage className="w-3 h-3 mr-1"/> PNG</span>
        <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
        <span className="flex items-center"><FileImage className="w-3 h-3 mr-1"/> JPG</span>
        <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
        <span className="flex items-center"><FileImage className="w-3 h-3 mr-1"/> WebP</span>
      </div>
    </div>
  );
}
