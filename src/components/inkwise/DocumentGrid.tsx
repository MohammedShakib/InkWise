"use client";

import { useInkWise } from '../../lib/store/InkWiseContext';
import { Trash2, FileImage } from 'lucide-react';
import Image from 'next/image';

export default function DocumentGrid() {
  const { images, removeImage } = useInkWise();

  return (
    <div className="flex-1 overflow-y-auto bg-[#F8FAFC] p-6 md:p-10">
      <div className="max-w-[1400px] mx-auto">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
          {images.map((img) => (
            <div 
              key={img.id}
              className="group relative bg-white rounded-xl shadow-sm border border-slate-200 hover:shadow-md hover:border-slate-300 transition-all overflow-hidden flex flex-col"
            >
              {/* Thumbnail Container */}
              <div className="relative aspect-[3/4] w-full bg-slate-50/50 flex items-center justify-center p-4">
                {img.thumbnailUrl ? (
                  <div className="relative w-full h-full shadow-[0_2px_12px_rgba(0,0,0,0.06)] bg-white rounded-sm overflow-hidden">
                    <Image 
                      src={img.thumbnailUrl} 
                      alt={img.file.name} 
                      fill
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <FileImage className="w-12 h-12 text-slate-300" />
                )}
                
                {/* Overlay Delete Button */}
                <button
                  onClick={() => removeImage(img.id)}
                  className="absolute top-2 right-2 bg-white/90 backdrop-blur text-slate-500 hover:text-red-500 hover:bg-white p-2 rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity z-10 border border-slate-100"
                  title="Remove image"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* File Info */}
              <div className="p-3 border-t border-slate-100 bg-white">
                <p className="text-[13px] font-medium text-slate-700 truncate" title={img.file.name}>
                  {img.file.name}
                </p>
                <div className="flex items-center justify-between mt-1">
                  <p className="text-[11px] text-slate-500">
                    {(img.file.size / (1024 * 1024)).toFixed(2)} MB
                  </p>
                  <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                    img.status === 'Ready' ? 'bg-slate-100 text-slate-600' :
                    img.status === 'Processing' ? 'bg-blue-100 text-blue-700' :
                    img.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {img.status}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
