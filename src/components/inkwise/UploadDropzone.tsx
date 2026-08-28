"use client";

import { useCallback, useState, useRef } from 'react';
import { FileImage, Sparkles } from 'lucide-react';
import { useInkWise } from '../../lib/store/InkWiseContext';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export default function UploadDropzone({ className }: { className?: string }) {
  const { addImages } = useInkWise();
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

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
          "relative flex flex-col items-center justify-center p-8 md:p-12 transition-all duration-200 w-full min-h-[280px] md:min-h-[320px] rounded-[24px] group",
          isDragging 
            ? "bg-blue-50/50 scale-[1.01]" 
            : "bg-white hover:bg-slate-50/30"
        ),
        className
      )}
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
    >
      <div className={clsx(
        "absolute inset-3 md:inset-4 border-2 border-dashed rounded-[16px] pointer-events-none transition-colors duration-200",
        isDragging ? "border-blue-400" : "border-slate-200 group-hover:border-slate-300"
      )}></div>
      
      <input
        type="file"
        multiple
        accept="image/png, image/jpeg, image/webp"
        onChange={handleFileChange}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
        title="Upload images"
        ref={inputRef}
      />

      <div className="relative z-10 flex flex-col items-center pointer-events-none">
        <div className="relative mb-6 transition-transform duration-200 group-hover:scale-105">
          <div className="absolute -top-2 -right-2 bg-blue-100 text-blue-600 p-1.5 rounded-full border-2 border-white z-10 shadow-sm">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <div className="bg-white p-4 rounded-2xl shadow-[0_4px_12px_rgba(0,0,0,0.03)] border border-slate-100">
            <FileImage className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        <h3 className="text-xl md:text-2xl font-semibold text-slate-900 mb-2">Drop your images here</h3>
        <p className="text-slate-500 mb-8 text-sm md:text-base">Drag & drop or choose from device</p>
        
        <div className="bg-blue-600 text-white font-medium px-8 py-3 rounded-lg shadow-sm transition-all group-hover:bg-blue-700 group-hover:shadow-md">
          Choose Images
        </div>

        <div className="mt-8 flex items-center space-x-3 text-[11px] font-medium text-slate-400 uppercase tracking-wider">
          <span>PNG</span>
          <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
          <span>JPG</span>
          <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
          <span>JPEG</span>
          <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
          <span>WebP</span>
        </div>
      </div>
    </div>
  );
}
