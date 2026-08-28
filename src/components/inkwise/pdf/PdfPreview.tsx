"use client";

import { useEffect, useState, useRef } from 'react';
import { pdfjsLib } from '../../../lib/pdf/pdf-setup';

import { ZoomIn, ZoomOut, Maximize } from 'lucide-react';

export default function PdfPreview({ pdfDoc, selectedPage }: { pdfDoc: pdfjsLib.PDFDocumentProxy | null, selectedPage: number }) {
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(100); // percentage
  const [fitMode, setFitMode] = useState<boolean>(true); // if true, uses w-full max-w-[800px]
  
  const lastRenderId = useRef(0);

  useEffect(() => {
    let active = true;
    const currentId = ++lastRenderId.current;

    async function updatePreview() {
      if (!pdfDoc) return;
      
      try {
        // 1. Render Original Document Page
        const page = await pdfDoc.getPage(selectedPage);
        const viewport = page.getViewport({ scale: 2.0 }); // High-quality view scale
        
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (!ctx) return;

        canvas.width = viewport.width;
        canvas.height = viewport.height;
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        await page.render({ canvasContext: ctx, viewport, background: 'white' } as any).promise;
        
        if (!active || currentId !== lastRenderId.current) return;

        const origUrl = canvas.toDataURL('image/jpeg', 0.9);
        setOriginalUrl(origUrl);
      } catch (e) {
        console.error('Preview error', e);
      }
    }

    updatePreview();

    return () => {
      active = false;
    };
  }, [pdfDoc, selectedPage]);

  const handleZoomIn = () => {
    setFitMode(false);
    setZoomLevel(prev => Math.min(prev + 10, 300));
  };

  const handleZoomOut = () => {
    setFitMode(false);
    setZoomLevel(prev => Math.max(prev - 10, 10));
  };

  const handleFit = () => {
    setFitMode(true);
    setZoomLevel(100);
  };

  return (
    <div className="flex-1 overflow-y-auto bg-slate-100/50 flex flex-col items-center p-4 md:p-8 relative">
      <div className="sticky top-0 z-10 self-start left-6 flex items-center space-x-3 bg-white/80 backdrop-blur px-3 py-1.5 rounded-full shadow-sm mb-4 border border-slate-200/60">
        <h3 className="font-semibold text-slate-700 text-sm">
          Page {selectedPage}
        </h3>
        <div className="w-px h-4 bg-slate-300"></div>
        <div className="flex items-center space-x-1">
          <button onClick={handleZoomOut} className="p-1 hover:bg-slate-100 rounded text-slate-600 transition-colors" title="Zoom Out">
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="text-xs font-medium text-slate-600 w-10 text-center select-none">
            {fitMode ? 'Fit' : `${zoomLevel}%`}
          </span>
          <button onClick={handleZoomIn} className="p-1 hover:bg-slate-100 rounded text-slate-600 transition-colors" title="Zoom In">
            <ZoomIn className="w-4 h-4" />
          </button>
          <div className="w-px h-3 bg-slate-200 mx-1"></div>
          <button onClick={handleFit} className={`p-1 rounded transition-colors ${fitMode ? 'bg-blue-50 text-blue-600' : 'hover:bg-slate-100 text-slate-600'}`} title="Fit Width">
            <Maximize className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      <div 
        className={`flex flex-col items-center justify-center transition-all duration-200 origin-top ${fitMode ? 'h-full w-full' : ''}`}
        style={fitMode ? {} : { width: `${zoomLevel}%` }}
      >
        {!originalUrl ? (
          <div className="flex flex-col items-center justify-center p-20 text-slate-400 h-full">
            <svg className="animate-spin h-8 w-8 text-blue-600 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span className="font-medium">Loading preview...</span>
          </div>
        ) : (
          <img 
            src={originalUrl} 
            alt={`Page ${selectedPage}`} 
            className={`bg-white shadow-xl border border-slate-200 ${
              fitMode 
                ? 'max-w-full max-h-[calc(100vh-140px)] object-contain' 
                : 'w-full h-auto'
            }`} 
          />
        )}
      </div>
    </div>
  );
}
