"use client";

import { useInkWise } from '@/lib/store/InkWiseContext';
import Header from '@/components/inkwise/Header';
import UploadDropzone from '@/components/inkwise/UploadDropzone';
import DocumentGrid from '@/components/inkwise/DocumentGrid';
import CleaningPanel from '@/components/inkwise/CleaningPanel';
import ExportPanel from '@/components/inkwise/ExportPanel';
import { Sparkles, ShieldCheck, Zap, Maximize } from 'lucide-react';

export default function Home() {
  const { images, clearAll } = useInkWise();

  return (
    <>
      <Header />
      
      {images.length === 0 ? (
        <main className="relative flex flex-1 flex-col items-center overflow-y-auto bg-[linear-gradient(180deg,#f8fbff_0%,#f8fafc_42%,#f1f5f9_100%)] px-4 py-8 md:py-14">
          
          {/* Subtle background element */}
          <div className="pointer-events-none absolute left-1/2 top-[-18%] h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-blue-500/7 blur-[110px]"></div>

          <div className="relative z-10 flex w-full max-w-[1200px] flex-col items-center">
            
            {/* Product Context Badge */}
            <div className="mb-6 flex items-center rounded-full border border-blue-100 bg-white/80 px-3 py-1.5 text-[13px] font-medium tracking-wide text-blue-700 shadow-sm shadow-blue-100/80 backdrop-blur-sm">
              <Sparkles className="mr-2 h-3.5 w-3.5 text-blue-500" />
              AI Note & Document Cleaner
            </div>
            
            <div className="mb-10 max-w-[650px] text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h2 className="mb-5 text-[36px] font-[800] leading-[1.1] tracking-tight text-slate-950 md:text-[52px]">
                Make your pages truly white.
              </h2>
              <p className="text-[17px] text-slate-600 md:text-lg">
                Clean AI-generated notes and document images for ink-friendly printing.
              </p>
            </div>

            {/* Workflow Indicator */}
            <div className="mb-10 flex items-center space-x-2 text-xs font-medium text-slate-400 animate-in fade-in duration-500 delay-100 md:space-x-4 md:text-sm">
              <span className="flex items-center rounded-full border border-slate-200 bg-white px-3 py-1.5 text-blue-700 shadow-sm shadow-slate-200/70">
                <span className="mr-2 flex h-4 w-4 items-center justify-center rounded-full bg-blue-100 text-[10px] font-bold text-blue-700">1</span>
                Upload
              </span>
              <div className="h-px w-6 bg-slate-200 md:w-12"></div>
              <span className="flex items-center">
                <span className="mr-2 flex h-4 w-4 items-center justify-center rounded-full bg-slate-100 text-[10px] font-bold text-slate-500">2</span>
                Clean
              </span>
              <div className="h-px w-6 bg-slate-200 md:w-12"></div>
              <span className="flex items-center">
                <span className="mr-2 flex h-4 w-4 items-center justify-center rounded-full bg-slate-100 text-[10px] font-bold text-slate-500">3</span>
                Download
              </span>
            </div>
            
            {/* Upload Area */}
            <div className="w-full max-w-[820px] rounded-[26px] border border-white/80 bg-white/90 p-1 shadow-[0_18px_45px_rgba(15,23,42,0.08)] animate-in fade-in zoom-in-95 duration-500 delay-200 fill-mode-both md:p-1.5">
              <UploadDropzone />
            </div>

            {/* Trust Row */}
            <div className="mt-8 flex flex-wrap justify-center gap-6 animate-in fade-in duration-500 delay-300 md:gap-12">
              <div className="flex items-center text-[13px] font-medium text-slate-500 md:text-sm">
                <ShieldCheck className="mr-2 h-4 w-4 text-slate-400" />
                Local Processing
              </div>
              <div className="flex items-center text-[13px] font-medium text-slate-500 md:text-sm">
                <Zap className="mr-2 h-4 w-4 text-slate-400" />
                Fast Batch Cleaning
              </div>
              <div className="flex items-center text-[13px] font-medium text-slate-500 md:text-sm">
                <Maximize className="mr-2 h-4 w-4 text-slate-400" />
                Original Resolution
              </div>
            </div>

          </div>
        </main>
      ) : (
        <main className="flex-1 flex flex-col md:flex-row overflow-hidden bg-[#F8FAFC] animate-in fade-in duration-300">
          <DocumentGrid />
          
          <div className="flex flex-col w-full md:w-[360px] shrink-0 border-l border-slate-200 bg-white overflow-y-auto z-10 shadow-[-8px_0_24px_rgba(0,0,0,0.04)]">
            <CleaningPanel />
            <ExportPanel />
          </div>
        </main>
      )}
    </>
  );
}
