"use client";

import { useEffect, useState, useRef } from 'react';
import { pdfjsLib } from '../../../lib/pdf/pdf-setup';

export default function PdfPreview({ pdfDoc, selectedPage }: { pdfDoc: pdfjsLib.PDFDocumentProxy | null, selectedPage: number }) {
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
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

  return (
    <div className="flex-1 overflow-y-auto bg-slate-100 flex flex-col items-center p-4 md:p-8 relative">
      <h3 className="sticky top-0 self-start left-6 z-10 font-semibold text-slate-700 bg-white/80 backdrop-blur px-3 py-1 rounded-full shadow-sm mb-4">
        Page {selectedPage} Preview
      </h3>
      
      <div className="w-full max-w-[800px] flex items-center justify-center">
        {!originalUrl ? (
          <div className="flex flex-col items-center justify-center p-20 text-slate-400">
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
            className="w-full h-auto bg-white shadow-xl border border-slate-200" 
          />
        )}
      </div>
    </div>
  );
}
