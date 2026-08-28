"use client";

import { useInkWise } from '@/lib/store/InkWiseContext';
import Header from '@/components/inkwise/Header';
import UploadDropzone from '@/components/inkwise/UploadDropzone';
import ImageQueue from '@/components/inkwise/ImageQueue';
import CompareViewer from '@/components/inkwise/CompareViewer';
import CleaningPanel from '@/components/inkwise/CleaningPanel';
import ExportPanel from '@/components/inkwise/ExportPanel';
import BackgroundAnalysis from '@/components/inkwise/BackgroundAnalysis';

export default function Home() {
  const { images } = useInkWise();

  return (
    <>
      <Header />
      
      {images.length === 0 ? (
        <main className="flex-1 overflow-y-auto bg-gray-50 flex flex-col items-center justify-center p-8">
          <div className="max-w-2xl w-full text-center mb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl mb-4">
              Make your pages truly white.
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              Clean AI-generated notes and document images for ink-friendly printing.
            </p>
            <div className="flex flex-col md:flex-row justify-center space-y-4 md:space-y-0 md:space-x-8 text-sm font-medium text-gray-700">
              <span className="flex items-center justify-center"><div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center mr-2">1</div> Upload</span>
              <span className="flex items-center justify-center"><div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center mr-2">2</div> Clean</span>
              <span className="flex items-center justify-center"><div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center mr-2">3</div> Download</span>
            </div>
          </div>
          
          <div className="max-w-3xl w-full bg-white rounded-3xl shadow-xl overflow-hidden p-2 animate-in fade-in zoom-in-95 duration-500 delay-150 fill-mode-both">
            <UploadDropzone className="border-0 bg-white hover:bg-gray-50 p-16" />
          </div>
        </main>
      ) : (
        <main className="flex-1 flex flex-col md:flex-row overflow-hidden bg-white animate-in fade-in duration-300">
          <ImageQueue />
          
          <CompareViewer />
          
          <div className="flex flex-col w-full md:w-[340px] shrink-0 border-l border-gray-100 bg-white overflow-y-auto z-10 shadow-[-4px_0_15px_rgba(0,0,0,0.02)]">
            <CleaningPanel />
            <BackgroundAnalysis />
            <ExportPanel />
          </div>
        </main>
      )}
    </>
  );
}
