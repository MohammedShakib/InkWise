"use client";

import { useEffect, useState, useRef } from 'react';
import { pdfjsLib } from '../../../lib/pdf/pdf-setup';
import { useInkWise } from '../../../lib/store/InkWiseContext';

interface PdfPageListProps {
  pdfDoc: pdfjsLib.PDFDocumentProxy | null;
  numPages: number;
  selectedPage: number;
  onSelectPage: (page: number) => void;
  loading: boolean;
}

export default function PdfPageList({ pdfDoc, numPages, selectedPage, onSelectPage, loading }: PdfPageListProps) {
  const { pdfFile } = useInkWise();
  const listRef = useRef<HTMLDivElement>(null);

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-4 bg-slate-50/50">
        <svg className="animate-spin h-6 w-6 text-slate-400 mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span className="text-sm font-medium text-slate-500">Loading document...</span>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50 border-r border-slate-200">
      <div className="p-4 pt-16 border-b border-slate-200 bg-white">
        <h3 className="font-semibold text-slate-800 text-[14px] truncate" title={pdfFile?.name}>{pdfFile?.name}</h3>
        <p className="text-[12px] text-slate-500 mt-0.5">{numPages} pages • {(pdfFile?.size! / (1024*1024)).toFixed(2)} MB</p>
      </div>
      
      <div className="flex-1 overflow-y-auto p-3 space-y-3" ref={listRef}>
        {Array.from({ length: numPages }, (_, i) => i + 1).map(pageNum => (
          <ThumbnailItem 
            key={pageNum}
            pageNum={pageNum}
            pdfDoc={pdfDoc}
            isSelected={selectedPage === pageNum}
            onClick={() => onSelectPage(pageNum)}
          />
        ))}
      </div>
    </div>
  );
}

function ThumbnailItem({ pageNum, pdfDoc, isSelected, onClick }: { pageNum: number, pdfDoc: pdfjsLib.PDFDocumentProxy | null, isSelected: boolean, onClick: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [rendered, setRendered] = useState(false);

  useEffect(() => {
    let active = true;

    async function renderThumb() {
      if (!pdfDoc || !canvasRef.current || rendered) return;
      
      try {
        const page = await pdfDoc.getPage(pageNum);
        const viewport = page.getViewport({ scale: 0.3 }); // very low res for thumbnail
        
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        canvas.width = viewport.width;
        canvas.height = viewport.height;

        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        await page.render({
          canvasContext: ctx,
          viewport,
          background: 'white'
        } as any).promise;

        if (active) {
          setRendered(true);
        }
      } catch (e) {
        console.error('Thumbnail render error', e);
      }
    }

    // Use IntersectionObserver to lazy load thumbnails? For simplicity, we just render them right away or use a simple timeout
    const timer = setTimeout(renderThumb, pageNum * 20); // staggered rendering
    
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [pdfDoc, pageNum, rendered]);

  return (
    <div 
      onClick={onClick}
      className={`relative cursor-pointer group flex flex-col items-center p-2 rounded-lg transition-all ${
        isSelected ? 'bg-blue-100/50 ring-2 ring-blue-500' : 'hover:bg-slate-200/50'
      }`}
    >
      <div className="relative w-full aspect-[1/1.414] bg-white rounded shadow-sm overflow-hidden flex items-center justify-center border border-slate-200">
        <canvas ref={canvasRef} className="w-full h-full object-contain" />
        {!rendered && <span className="absolute text-[10px] text-slate-300">...</span>}
      </div>
      <span className={`text-[11px] font-medium mt-1.5 ${isSelected ? 'text-blue-700' : 'text-slate-500 group-hover:text-slate-700'}`}>
        {pageNum}
      </span>
    </div>
  );
}
