"use client";

import { useEffect, useState, useRef, useCallback } from 'react';
import { useInkWise } from '../../../lib/store/InkWiseContext';
import { pdfjsLib } from '../../../lib/pdf/pdf-setup';
import PdfPageList from './PdfPageList';
import PdfPreview from './PdfPreview';
import PdfSettings from './PdfSettings';
import { processPdf, PdfProcessingState } from '../../../lib/pdf/pdf-cleaner';

export default function PdfWorkspace() {
  const { pdfFile, settings, printSettings, pdfSettings } = useInkWise();
  
  const [pdfDoc, setPdfDoc] = useState<pdfjsLib.PDFDocumentProxy | null>(null);
  const [numPages, setNumPages] = useState<number>(0);
  const [selectedPage, setSelectedPage] = useState<number>(1);
  const [loading, setLoading] = useState(true);

  const [processingState, setProcessingState] = useState<PdfProcessingState | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    let active = true;
    
    async function loadDocument() {
      if (!pdfFile) return;
      try {
        setLoading(true);
        const arrayBuffer = await pdfFile.arrayBuffer();
        const doc = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        
        if (active) {
          setPdfDoc(doc);
          setNumPages(doc.numPages);
          setSelectedPage(1);
          setLoading(false);
        }
      } catch (e) {
        console.error('Failed to load PDF', e);
        if (active) setLoading(false);
      }
    }

    loadDocument();

    return () => {
      active = false;
      if (pdfDoc) (pdfDoc as any).destroy();
    };
  }, [pdfFile]);

  const handleCleanPdf = useCallback(async () => {
    if (!pdfFile) return;

    abortControllerRef.current = new AbortController();

    await processPdf({
      file: pdfFile,
      settings,
      printSettings,
      dpi: pdfSettings.dpi,
      quality: pdfSettings.quality,
      pageRange: pdfSettings.pageRange,
      onProgress: (state) => setProcessingState(state),
      signal: abortControllerRef.current.signal,
    });
  }, [pdfFile, settings, printSettings, pdfSettings]);

  const cancelProcessing = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  };

  const downloadResult = () => {
    if (processingState?.blob && pdfFile) {
      const url = URL.createObjectURL(processingState.blob);
      const a = document.createElement('a');
      a.href = url;
      
      const extIdx = pdfFile.name.lastIndexOf('.');
      const name = extIdx === -1 ? pdfFile.name : pdfFile.name.slice(0, extIdx);
      // We hardcode the prefix '_clean' as requested in prompt, or use settings.
      a.download = `${name}_clean.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  if (!pdfFile) return null;

  return (
    <div className="flex-1 flex flex-col md:flex-row overflow-hidden bg-[#F8FAFC] animate-in fade-in duration-300 w-full h-full relative">
      
      {/* Processing Overlay */}
      {processingState && processingState.status !== 'idle' && (
        <div className="absolute inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 flex flex-col items-center">
            {processingState.status === 'completed' ? (
              <>
                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">PDF Cleaned Successfully</h3>
                <p className="text-slate-500 mb-6 text-center">
                  {processingState.totalPages} pages processed.
                </p>
                <div className="flex w-full space-x-3">
                  <button onClick={() => setProcessingState(null)} className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl">
                    Close
                  </button>
                  <button onClick={downloadResult} className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl">
                    Download PDF
                  </button>
                </div>
              </>
            ) : processingState.status === 'error' ? (
              <>
                <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">Processing Failed</h3>
                <p className="text-slate-500 mb-6 text-center">{processingState.errorMsg}</p>
                <button onClick={() => setProcessingState(null)} className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl">
                  Close
                </button>
              </>
            ) : processingState.status === 'cancelled' ? (
              <>
                <h3 className="text-xl font-bold text-slate-800 mb-2">Cancelled</h3>
                <button onClick={() => setProcessingState(null)} className="mt-4 w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl">
                  Close
                </button>
              </>
            ) : (
              <>
                <h3 className="text-xl font-bold text-slate-800 mb-4">
                  {processingState.status === 'loading' ? 'Preparing PDF...' : processingState.status === 'building' ? 'Finalizing PDF...' : 'Cleaning PDF...'}
                </h3>
                
                <div className="w-full bg-slate-100 rounded-full h-3 mb-2 overflow-hidden">
                  <div 
                    className="bg-blue-600 h-full rounded-full transition-all duration-300"
                    style={{ width: `${processingState.totalPages ? (processingState.currentPage / processingState.totalPages) * 100 : 0}%` }}
                  ></div>
                </div>
                
                <div className="flex justify-between w-full text-sm font-medium text-slate-500 mb-8">
                  <span>Page {processingState.currentPage} of {processingState.totalPages}</span>
                  {processingState.failed > 0 && <span className="text-red-500">{processingState.failed} failed</span>}
                </div>
                
                <button onClick={cancelProcessing} className="py-2.5 px-6 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 font-semibold rounded-lg shadow-sm">
                  Cancel Job
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Left Sidebar: Page Thumbnails */}
      <div className="w-full md:w-[240px] shrink-0 border-r border-slate-200 bg-white overflow-hidden z-10 flex flex-col">
        <PdfPageList 
          pdfDoc={pdfDoc} 
          numPages={numPages} 
          selectedPage={selectedPage} 
          onSelectPage={setSelectedPage} 
          loading={loading}
        />
      </div>

      {/* Center: Selected Page Preview */}
      <div className="flex-1 overflow-hidden relative bg-slate-100 flex flex-col">
        <PdfPreview pdfDoc={pdfDoc} selectedPage={selectedPage} />
      </div>

      {/* Right Sidebar: Settings & Process */}
      <div className="flex flex-col w-full md:w-[320px] shrink-0 border-l border-slate-200 bg-white overflow-hidden z-10 shadow-[-8px_0_24px_rgba(0,0,0,0.04)]">
        <PdfSettings onClean={handleCleanPdf} numPages={numPages} />
      </div>
    </div>
  );
}
