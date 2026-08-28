"use client";

import { useInkWise } from '@/lib/store/InkWiseContext';
import Header from '@/components/inkwise/Header';
import UploadDropzone from '@/components/inkwise/UploadDropzone';
import ImageQueue from '@/components/inkwise/ImageQueue';
import CompareViewer from '@/components/inkwise/CompareViewer';
import CleaningPanel from '@/components/inkwise/CleaningPanel';
import ExportPanel from '@/components/inkwise/ExportPanel';
import BackgroundAnalysis from '@/components/inkwise/BackgroundAnalysis';
import { Sparkles, ShieldCheck, Zap, Maximize } from 'lucide-react';

export default function Home() {
  const { images } = useInkWise();

  return (
    <>
      <Header />
      
      {images.length === 0 ? (
        <main className="flex-1 overflow-y-auto bg-[#F8FAFC] flex flex-col items-center px-4 py-10 md:py-16 relative">
          
          {/* Subtle background element */}
          <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-[100px] pointer-events-none"></div>

          <div className="max-w-[1200px] w-full flex flex-col items-center relative z-10">
            
            {/* Product Context Badge */}
            <div className="mb-6 flex items-center bg-blue-50 border border-blue-100/50 text-blue-700 px-3 py-1.5 rounded-full text-[13px] font-medium tracking-wide shadow-sm">
              <Sparkles className="w-3.5 h-3.5 mr-2 text-blue-500" />
              AI Note & Document Cleaner
            </div>
            
            <div className="text-center mb-10 max-w-[650px] animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h2 className="text-[36px] leading-[1.15] md:text-[52px] font-[800] tracking-tight text-slate-900 mb-5">
                Make your pages truly white.
              </h2>
              <p className="text-[17px] text-slate-500 md:text-lg">
                Clean AI-generated notes and document images for ink-friendly printing.
              </p>
            </div>

            {/* Workflow Indicator */}
            <div className="flex items-center space-x-2 md:space-x-4 text-xs md:text-sm font-medium mb-10 animate-in fade-in duration-500 delay-100 text-slate-400">
              <span className="flex items-center text-blue-700 bg-white shadow-sm border border-slate-100 px-3 py-1.5 rounded-full">
                <span className="w-4 h-4 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-[10px] mr-2 font-bold">1</span> 
                Upload
              </span>
              <div className="w-6 md:w-12 h-px bg-slate-200"></div>
              <span className="flex items-center">
                <span className="w-4 h-4 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center text-[10px] mr-2 font-bold">2</span> 
                Clean
              </span>
              <div className="w-6 md:w-12 h-px bg-slate-200"></div>
              <span className="flex items-center">
                <span className="w-4 h-4 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center text-[10px] mr-2 font-bold">3</span> 
                Download
              </span>
            </div>
            
            {/* Upload Area */}
            <div className="w-full max-w-[820px] bg-white rounded-[26px] shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-slate-100 p-1 md:p-1.5 animate-in fade-in zoom-in-95 duration-500 delay-200 fill-mode-both">
              <UploadDropzone />
            </div>

            {/* Trust Row */}
            <div className="mt-8 flex flex-wrap justify-center gap-6 md:gap-12 animate-in fade-in duration-500 delay-300">
              <div className="flex items-center text-slate-500 text-[13px] md:text-sm font-medium">
                <ShieldCheck className="w-4 h-4 mr-2 text-slate-400" />
                Local Processing
              </div>
              <div className="flex items-center text-slate-500 text-[13px] md:text-sm font-medium">
                <Zap className="w-4 h-4 mr-2 text-slate-400" />
                Fast Batch Cleaning
              </div>
              <div className="flex items-center text-slate-500 text-[13px] md:text-sm font-medium">
                <Maximize className="w-4 h-4 mr-2 text-slate-400" />
                Original Resolution
              </div>
            </div>

          </div>
        </main>
      ) : (
        <main className="flex-1 flex flex-col md:flex-row overflow-hidden bg-white animate-in fade-in duration-300">
          <ImageQueue />
          
          <CompareViewer />
          
          <div className="flex flex-col w-full md:w-[340px] shrink-0 border-l border-slate-100 bg-white overflow-y-auto z-10 shadow-[-4px_0_15px_rgba(0,0,0,0.02)]">
            <CleaningPanel />
            <BackgroundAnalysis />
            <ExportPanel />
          </div>
        </main>
      )}
    </>
  );
}
