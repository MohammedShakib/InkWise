"use client";

import { useEffect, useRef, useState } from 'react';
import { useInkWise } from '../../lib/store/InkWiseContext';
import { applyLevels } from '../../lib/image-processing/levels';
import { applyGrayscale, increaseTextContrast, flattenTransparency } from '../../lib/image-processing/grayscale';

export default function CompareViewer() {
  const { images, selectedImageId, settings, printSettings } = useInkWise();
  const selectedImage = images.find(img => img.id === selectedImageId);
  
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const [previewDataUrl, setPreviewDataUrl] = useState<string | null>(null);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Real-time preview generation using the low-res thumbnail
  useEffect(() => {
    if (!selectedImage) {
      setPreviewDataUrl(null);
      return;
    }

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = selectedImage.thumbnailUrl;
    
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) return;
      
      ctx.drawImage(img, 0, 0);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      
      if (printSettings.flattenTransparency) flattenTransparency(imageData.data);
      applyLevels(imageData.data, settings.blackPoint, settings.whitePoint, settings.gamma);
      if (printSettings.grayscale) applyGrayscale(imageData.data);
      if (printSettings.increaseTextContrast) increaseTextContrast(imageData.data);
      
      ctx.putImageData(imageData, 0, 0);
      setPreviewDataUrl(canvas.toDataURL('image/jpeg', 0.9));
    };
  }, [selectedImage, settings, printSettings]);

  if (!selectedImage) return null;

  return (
    <div className="flex-1 flex flex-col items-center justify-center bg-gray-100 p-4 md:p-8 overflow-hidden relative">
      <div 
        className="relative w-full max-w-4xl h-full flex items-center justify-center select-none"
        onMouseMove={(e) => {
          if (!isDragging) return;
          const rect = e.currentTarget.getBoundingClientRect();
          const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
          setSliderPosition((x / rect.width) * 100);
        }}
        onMouseUp={() => setIsDragging(false)}
        onMouseLeave={() => setIsDragging(false)}
        onTouchMove={(e) => {
          if (!isDragging) return;
          const rect = e.currentTarget.getBoundingClientRect();
          const touch = e.touches[0];
          const x = Math.max(0, Math.min(touch.clientX - rect.left, rect.width));
          setSliderPosition((x / rect.width) * 100);
        }}
        onTouchEnd={() => setIsDragging(false)}
      >
        <div className="relative w-full h-full max-h-[80vh] flex justify-center bg-white shadow-md border border-gray-200">
          {/* Before Image (Original Thumbnail) */}
          <img 
            src={selectedImage.thumbnailUrl} 
            className="absolute top-0 left-0 w-full h-full object-contain pointer-events-none" 
            alt="Before" 
          />
          
          {/* After Image (Processed Preview) */}
          {previewDataUrl && (
            <img 
              src={previewDataUrl} 
              className="absolute top-0 left-0 w-full h-full object-contain pointer-events-none"
              style={{ clipPath: `polygon(0 0, ${sliderPosition}% 0, ${sliderPosition}% 100%, 0 100%)` }}
              alt="After" 
            />
          )}

          {/* Slider Divider */}
          <div 
            className="absolute top-0 bottom-0 w-1 bg-white cursor-ew-resize shadow-[0_0_10px_rgba(0,0,0,0.5)] z-10"
            style={{ left: `calc(${sliderPosition}% - 2px)` }}
            onMouseDown={() => setIsDragging(true)}
            onTouchStart={() => setIsDragging(true)}
          >
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full shadow-md flex items-center justify-center">
              <div className="w-1 h-4 border-l border-r border-gray-400"></div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-4 flex justify-between w-full max-w-4xl text-sm font-medium text-gray-500">
        <span className={sliderPosition > 20 ? 'opacity-100' : 'opacity-0'}>AFTER</span>
        <span className={sliderPosition < 80 ? 'opacity-100' : 'opacity-0'}>BEFORE</span>
      </div>
    </div>
  );
}
