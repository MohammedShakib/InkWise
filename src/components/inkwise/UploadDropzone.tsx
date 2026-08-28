"use client";

import { useCallback, useState, useRef } from 'react';
import { FileImage, Sparkles } from 'lucide-react';
import { useInkWise } from '../../lib/store/InkWiseContext';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export default function UploadDropzone({ className }: { className?: string }) {
  const { addImages, setPdfFile } = useInkWise();
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);
      
      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        const fileList = Array.from(e.dataTransfer.files);
        
        // Handle PDF
        const pdfFile = fileList.find(f => f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf'));
        if (pdfFile) {
          setPdfFile(pdfFile);
          return;
        }

        // Handle Images
        const files = fileList.filter(file => 
          file.type.startsWith('image/png') || 
          file.type.startsWith('image/jpeg') || 
          file.type.startsWith('image/webp')
        );
        if (files.length > 0) addImages(files);
      }
    },
    [addImages, setPdfFile]
  );

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        const fileList = Array.from(e.target.files);
        
        // Handle PDF
        const pdfFile = fileList.find(f => f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf'));
        if (pdfFile) {
          setPdfFile(pdfFile);
          return;
        }

        // Handle Images
        addImages(fileList);
      }
    },
    [addImages, setPdfFile]
  );

  return (
    <div
      className={twMerge(
        clsx(
          "relative flex flex-col items-center justify-center p-6 md:p-10 transition-all duration-200 w-full min-h-[270px] md:min-h-[320px] rounded-[22px] md:rounded-[24px] group bg-white",
          isDragging ? "bg-blue-50/30" : "hover:bg-slate-50/40"
        ),
        className
      )}
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
    >
      <div className={clsx(
        "absolute inset-3 md:inset-4 border-[1.5px] border-dashed rounded-[14px] md:rounded-[16px] pointer-events-none transition-colors duration-200",
        isDragging ? "border-blue-400 bg-blue-50/20" : "border-slate-300/80 group-hover:border-blue-300"
      )}></div>
      
      <input
        type="file"
        multiple
        accept="image/png, image/jpeg, image/webp, application/pdf"
        onChange={handleFileChange}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
        title="Upload images or PDF"
        ref={inputRef}
      />

      <div className="relative z-10 flex flex-col items-center pointer-events-none">
        
        <div className="relative mb-5 transition-transform duration-200 group-hover:scale-[1.03]">
          <div className="absolute -top-1.5 -right-1.5 bg-[#EFF6FF] text-[#2563EB] p-1 rounded-full border-2 border-white z-10">
            <Sparkles className="w-3 h-3" />
          </div>
          <div className="bg-[#EFF6FF] w-12 h-12 md:w-14 md:h-14 flex items-center justify-center rounded-[14px] border border-blue-100/50 text-[#2563EB]">
            <FileImage className="w-6 h-6 md:w-7 md:h-7" />
          </div>
        </div>

        {isDragging ? (
          <h3 className="text-[20px] md:text-[22px] font-[650] text-[#2563EB] mb-1">Drop to add your images or PDF</h3>
        ) : (
          <h3 className="text-[20px] md:text-[22px] font-[650] text-[#0F172A] mb-1">Drop your images or PDF here</h3>
        )}
        
        <p className="text-[#64748B] mb-7 text-[14px] md:text-[15px]">
          Drag & drop images or a PDF document
        </p>
        
        <div className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-[15px] font-medium px-[28px] h-[46px] flex items-center justify-center rounded-[11px] shadow-[0_2px_4px_rgba(37,99,235,0.15)] transition-all duration-150 group-hover:-translate-y-[1px]">
          Choose Files
        </div>

        <div className="mt-6 flex items-center space-x-4 text-[11px] font-medium text-slate-400 tracking-wider">
          <span>PNG</span>
          <span>JPG</span>
          <span>JPEG</span>
          <span>WEBP</span>
          <span className="w-1 h-1 bg-slate-300 rounded-full mx-1"></span>
          <span>PDF</span>
        </div>
      </div>
    </div>
  );
}
