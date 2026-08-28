"use client";

import { useInkWise } from '@/lib/store/InkWiseContext';
import Header from '@/components/inkwise/Header';
import UploadDropzone from '@/components/inkwise/UploadDropzone';
import DocumentGrid from '@/components/inkwise/DocumentGrid';
import SettingsPanel from '@/components/inkwise/SettingsPanel';
import dynamic from 'next/dynamic';
import { Sparkles, ShieldCheck, Zap, Maximize } from 'lucide-react';

const PdfWorkspace = dynamic(() => import('@/components/inkwise/pdf/PdfWorkspace'), { ssr: false });

export default function Home() {
  const { images, pdfFile } = useInkWise();

  return (
    <div className="h-screen flex flex-col bg-[#F8FAFC] overflow-hidden">
      <Header />
      
      {pdfFile ? (
        <PdfWorkspace />
      ) : images.length === 0 ? (
        <main className="flex-1 overflow-y-auto relative flex flex-col items-center">
          {/* Extremely subtle radial glow background */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#EFF6FF]/60 via-transparent to-transparent pointer-events-none opacity-60"></div>

          <div className="w-full max-w-[1140px] px-4 md:px-6 py-6 md:py-10 flex flex-col items-center relative z-10">
            
            {/* Product Context Badge */}
            <div className="mb-4 flex items-center bg-[#EFF6FF] border border-[#2563EB]/10 text-[#2563EB] px-2.5 py-1 rounded-full text-[11px] font-medium tracking-wide">
              <Sparkles className="w-3 h-3 mr-1.5" />
              AI Note & Document Cleaner
            </div>
            
            <div className="text-center mb-6 max-w-[620px]">
              <h2 className="text-[36px] md:text-[52px] leading-[1.02] font-[750] tracking-tight text-[#0F172A] mb-3">
                Make your pages truly white.
              </h2>
              <p className="text-[15px] md:text-[16px] text-[#64748B] leading-relaxed mx-auto max-w-[560px]">
                Clean AI-generated notes and document images for ink-friendly printing.
              </p>
            </div>

            {/* Workflow Indicator */}
            <div className="flex items-center text-[13px] md:text-[14px] font-medium mb-8 text-[#64748B]">
              <div className="flex items-center text-[#2563EB]">
                <div className="w-2 h-2 rounded-full bg-[#2563EB] mr-2"></div>
                Upload
              </div>
              <div className="w-8 md:w-14 h-[1.5px] bg-[#E2E8F0] mx-3 md:mx-4"></div>
              <div className="flex items-center">
                <div className="w-2 h-2 rounded-full border-2 border-[#E2E8F0] mr-2"></div>
                Clean
              </div>
              <div className="w-8 md:w-14 h-[1.5px] bg-[#E2E8F0] mx-3 md:mx-4"></div>
              <div className="flex items-center">
                <div className="w-2 h-2 rounded-full border-2 border-[#E2E8F0] mr-2"></div>
                Download
              </div>
            </div>
            
            {/* Upload Area */}
            <div className="w-full max-w-[780px] bg-white rounded-[24px] shadow-[0_4px_16px_rgba(15,23,42,0.03)] border border-[#E2E8F0] p-1 md:p-1.5 relative z-20">
              <UploadDropzone />
            </div>

            {/* Trust Row */}
            <div className="mt-6 flex flex-wrap justify-center gap-5 md:gap-8 max-w-[600px]">
              <div className="flex items-center text-[#64748B] text-[13px] font-medium">
                <ShieldCheck className="w-[15px] h-[15px] mr-1.5 opacity-80" />
                Local Processing
              </div>
              <div className="flex items-center text-[#64748B] text-[13px] font-medium">
                <Zap className="w-[15px] h-[15px] mr-1.5 opacity-80" />
                Fast Batch Cleaning
              </div>
              <div className="flex items-center text-[#64748B] text-[13px] font-medium">
                <Maximize className="w-[15px] h-[15px] mr-1.5 opacity-80" />
                Original Resolution
              </div>
            </div>

          </div>
        </main>
      ) : (
        <main className="flex-1 flex flex-col md:flex-row overflow-hidden bg-[#F8FAFC] animate-in fade-in duration-300">
          <DocumentGrid />
          
          <div className="flex flex-col w-full md:w-[320px] shrink-0 border-l border-slate-200 bg-white overflow-hidden z-10 shadow-[-8px_0_24px_rgba(0,0,0,0.04)]">
            <SettingsPanel />
          </div>
        </main>
      )}
    </div>
  );
}
