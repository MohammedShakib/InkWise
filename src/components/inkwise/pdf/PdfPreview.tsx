"use client";

import { useEffect, useState, useRef } from 'react';
import { pdfjsLib } from '../../../lib/pdf/pdf-setup';
import { useInkWise } from '../../../lib/store/InkWiseContext';
import { getWorkerPool } from '../../../lib/image-processing/worker-client';

export default function PdfPreview({ pdfDoc, selectedPage }: { pdfDoc: pdfjsLib.PDFDocumentProxy | null, selectedPage: number }) {
  const { settings, printSettings } = useInkWise();
  
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [cleanedUrl, setCleanedUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [sliderPos, setSliderPos] = useState(50);

  const containerRef = useRef<HTMLDivElement>(null);
  const lastRenderId = useRef(0);

  useEffect(() => {
    let active = true;
    const currentId = ++lastRenderId.current;

    async function updatePreview() {
      if (!pdfDoc) return;
      
      try {
        setIsProcessing(true);
        
        // 1. Render Original
        const page = await pdfDoc.getPage(selectedPage);
        const viewport = page.getViewport({ scale: 1.5 }); // Preview scale
        
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (!ctx) return;

        canvas.width = viewport.width;
        canvas.height = viewport.height;
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        await page.render({ canvasContext: ctx, viewport, background: 'white' } as any).promise;
        
        if (!active || currentId !== lastRenderId.current) return;

        const origUrl = canvas.toDataURL('image/jpeg', 0.8);
        setOriginalUrl(origUrl);

        // 2. Process for Cleaned
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const pool = getWorkerPool();
        
        const result = await pool.processImage({
          id: `preview-${selectedPage}-${Date.now()}`,
          imageData,
          settings,
          printSettings
        });

        if (!active || currentId !== lastRenderId.current) return;

        if (result.imageData) {
          ctx.putImageData(result.imageData, 0, 0);
          const cleanUrl = canvas.toDataURL('image/jpeg', 0.8);
          setCleanedUrl(cleanUrl);
        }

        setIsProcessing(false);
      } catch (e) {
        console.error('Preview error', e);
        if (active && currentId === lastRenderId.current) {
          setIsProcessing(false);
        }
      }
    }

    updatePreview();

    return () => {
      active = false;
    };
  }, [pdfDoc, selectedPage, settings, printSettings]);

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4 md:p-8 relative">
      <h3 className="absolute top-4 left-6 font-semibold text-slate-700">Page {selectedPage} Preview</h3>
      
      <div 
        ref={containerRef}
        className="relative w-full max-w-[800px] aspect-[1/1.414] bg-white shadow-xl flex items-center justify-center overflow-hidden border border-slate-200"
        onMouseMove={(e) => {
          if (!containerRef.current) return;
          const rect = containerRef.current.getBoundingClientRect();
          const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
          setSliderPos((x / rect.width) * 100);
        }}
        onTouchMove={(e) => {
          if (!containerRef.current) return;
          const rect = containerRef.current.getBoundingClientRect();
          const x = Math.max(0, Math.min(e.touches[0].clientX - rect.left, rect.width));
          setSliderPos((x / rect.width) * 100);
        }}
      >
        {!originalUrl ? (
          <span className="text-slate-400 font-medium">Loading preview...</span>
        ) : (
          <>
            {/* Original Image (Background) */}
            <img src={originalUrl} alt="Original" className="absolute inset-0 w-full h-full object-contain pointer-events-none" />
            
            {/* Cleaned Image (Foreground, clipped) */}
            {cleanedUrl && (
              <div 
                className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none"
                style={{ clipPath: `inset(0 0 0 ${sliderPos}%)` }}
              >
                <img src={cleanedUrl} alt="Cleaned" className="absolute inset-0 w-full h-full object-contain" />
              </div>
            )}
            
            {/* Slider Handle */}
            <div 
              className="absolute top-0 bottom-0 w-0.5 bg-blue-500 shadow-[0_0_4px_rgba(0,0,0,0.5)] pointer-events-none z-20 flex items-center justify-center"
              style={{ left: `${sliderPos}%` }}
            >
              <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center shadow-md">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
                </svg>
              </div>
            </div>

            {/* Labels */}
            <div className="absolute bottom-4 left-4 bg-slate-900/70 text-white px-3 py-1 rounded-full text-xs font-medium backdrop-blur-sm pointer-events-none z-10">
              Cleaned
            </div>
            <div className="absolute bottom-4 right-4 bg-slate-900/70 text-white px-3 py-1 rounded-full text-xs font-medium backdrop-blur-sm pointer-events-none z-10">
              Original
            </div>
          </>
        )}
        
        {isProcessing && originalUrl && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/30 backdrop-blur-sm z-30">
            <svg className="animate-spin h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        )}
      </div>
      
      <p className="mt-6 text-sm text-slate-500 font-medium">Slide to compare Original vs Cleaned</p>
    </div>
  );
}
