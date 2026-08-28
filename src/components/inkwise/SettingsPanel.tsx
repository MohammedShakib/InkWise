"use client";

import { useState } from 'react';
import { useInkWise } from '../../lib/store/InkWiseContext';
import { Archive, PlayCircle, Settings2, SlidersHorizontal } from 'lucide-react';
import JSZip from 'jszip';
import { getWorkerPool } from '../../lib/image-processing/worker-client';
import { fileToImageData, imageDataToBlob } from '../../lib/image-processing/image-utils';

export default function SettingsPanel() {
  const { 
    images, 
    settings,
    printSettings, 
    updatePrintSettings,
    exportSettings, 
    updateExportSettings, 
    updateImageStatus 
  } = useInkWise();
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0, failed: 0 });

  const processAll = async () => {
    // Note: The UI no longer lets the user select 'Cleaning Mode', so the underlying
    // engine will use the 'settings' from InkWiseContext which defaults to Standard.
    const toProcess = images.filter((img) => img.status !== 'Processing');
    if (toProcess.length === 0) return;

    setIsProcessing(true);
    setProgress({ current: 0, total: toProcess.length, failed: 0 });

    const pool = getWorkerPool();

    const promises = toProcess.map(async (img) => {
      try {
        updateImageStatus(img.id, { status: 'Processing', error: undefined });
        
        const imageData = await fileToImageData(img.file);
        
        const result = await pool.processImage({
          id: img.id,
          imageData,
          settings, // Using defaults
          printSettings
        });

        if (result.error || !result.imageData) {
          throw new Error(result.error || 'No image data returned');
        }

        const blob = await imageDataToBlob(result.imageData, exportSettings.format, exportSettings.quality);
        const processedUrl = URL.createObjectURL(blob);

        if (img.processedUrl) {
          URL.revokeObjectURL(img.processedUrl);
        }

        updateImageStatus(img.id, { 
          status: 'Completed', 
          processedBlob: blob, 
          processedUrl,
          analysisBefore: result.analysisBefore,
          analysisAfter: result.analysisAfter
        });
        
        setProgress(p => ({ ...p, current: p.current + 1 }));
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Processing failed';
        updateImageStatus(img.id, { status: 'Failed', error: message });
        setProgress((p) => ({ ...p, failed: p.failed + 1, current: p.current + 1 }));
      }
    });

    await Promise.allSettled(promises);
    setIsProcessing(false);
  };

  const downloadZip = async () => {
    const completed = images.filter(img => img.status === 'Completed' && img.processedBlob);
    if (completed.length === 0) return;

    const zip = new JSZip();
    completed.forEach(img => {
      const extIdx = img.name.lastIndexOf('.');
      const name = extIdx === -1 ? img.name : img.name.slice(0, extIdx);
      const ext = exportSettings.format === 'jpeg' ? 'jpg' : exportSettings.format;
      const finalName = `${exportSettings.prefix}${name}.${ext}`;
      
      zip.file(finalName, img.processedBlob!);
    });

    const content = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(content);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = 'inkwise-cleaned-images.zip';
    a.click();
    
    URL.revokeObjectURL(url);
  };

  const actionCount = images.filter((img) => img.status !== 'Processing').length;
  const completedCount = images.filter((img) => img.status === 'Completed').length;

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="p-5 md:p-6 border-b border-slate-100 flex items-center">
        <Settings2 className="w-5 h-5 text-slate-400 mr-2.5" />
        <h2 className="text-[16px] font-semibold text-slate-800 tracking-tight">Image Options</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-5 md:p-6 space-y-8">
        
        {/* Print Optimization */}
        <div>
          <div className="flex items-center mb-4">
            <SlidersHorizontal className="w-4 h-4 text-slate-400 mr-2" />
            <h3 className="text-sm font-semibold text-slate-700">Print Optimization</h3>
          </div>
          <div className="space-y-3">
            <label className="flex items-center group cursor-pointer">
              <div className="relative flex items-center justify-center">
                <input
                  type="checkbox"
                  checked={printSettings.grayscale}
                  onChange={(e) => updatePrintSettings({ grayscale: e.target.checked })}
                  className="peer sr-only"
                />
                <div className="w-5 h-5 rounded border border-slate-300 bg-white peer-checked:bg-blue-600 peer-checked:border-blue-600 transition-colors group-hover:border-blue-400 flex items-center justify-center">
                  {printSettings.grayscale && (
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                  )}
                </div>
              </div>
              <span className="ml-3 text-[13.5px] font-medium text-slate-600 group-hover:text-slate-900 transition-colors">
                Convert to Grayscale
              </span>
            </label>
            
            <label className="flex items-center group cursor-pointer">
              <div className="relative flex items-center justify-center">
                <input
                  type="checkbox"
                  checked={printSettings.increaseTextContrast}
                  onChange={(e) => updatePrintSettings({ increaseTextContrast: e.target.checked })}
                  className="peer sr-only"
                />
                <div className="w-5 h-5 rounded border border-slate-300 bg-white peer-checked:bg-blue-600 peer-checked:border-blue-600 transition-colors group-hover:border-blue-400 flex items-center justify-center">
                  {printSettings.increaseTextContrast && (
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                  )}
                </div>
              </div>
              <span className="ml-3 text-[13.5px] font-medium text-slate-600 group-hover:text-slate-900 transition-colors">
                Increase Text Contrast
              </span>
            </label>

            <label className="flex items-center group cursor-pointer">
              <div className="relative flex items-center justify-center">
                <input
                  type="checkbox"
                  checked={printSettings.flattenTransparency}
                  onChange={(e) => updatePrintSettings({ flattenTransparency: e.target.checked })}
                  className="peer sr-only"
                />
                <div className="w-5 h-5 rounded border border-slate-300 bg-white peer-checked:bg-blue-600 peer-checked:border-blue-600 transition-colors group-hover:border-blue-400 flex items-center justify-center">
                  {printSettings.flattenTransparency && (
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                  )}
                </div>
              </div>
              <span className="ml-3 text-[13.5px] font-medium text-slate-600 group-hover:text-slate-900 transition-colors">
                Flatten Transparency
              </span>
            </label>
          </div>
        </div>

        <div className="h-px bg-slate-100 w-full"></div>

        {/* Output Format */}
        <div className="space-y-5">
          <div>
            <label className="text-[13px] font-semibold text-slate-700 block mb-2.5">Output Format</label>
            <div className="flex space-x-2">
              {(['png', 'jpeg', 'webp'] as const).map(fmt => (
                <button
                  key={fmt}
                  onClick={() => updateExportSettings({ format: fmt })}
                  className={`flex-1 py-2 text-[12px] font-bold rounded-lg border transition-all ${
                    exportSettings.format === fmt 
                      ? 'bg-blue-50 text-blue-700 border-blue-200 shadow-sm' 
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:border-slate-300'
                  }`}
                >
                  {fmt.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
          
          {exportSettings.format !== 'png' && (
            <div>
              <div className="flex justify-between text-[13px] mb-2">
                <label className="font-semibold text-slate-700">Quality</label>
                <span className="text-blue-600 font-bold">{Math.round(exportSettings.quality * 100)}%</span>
              </div>
              <input 
                type="range" min="0.1" max="1.0" step="0.05" value={exportSettings.quality}
                onChange={(e) => updateExportSettings({ quality: Number(e.target.value) })}
                className="w-full accent-blue-600 h-1.5 bg-slate-200 rounded-full appearance-none cursor-pointer outline-none hover:accent-blue-700"
              />
            </div>
          )}

          <div>
            <label className="text-[13px] font-semibold text-slate-700 block mb-2">Filename Prefix</label>
            <input 
              type="text" 
              value={exportSettings.prefix}
              onChange={(e) => updateExportSettings({ prefix: e.target.value })}
              className="w-full px-3.5 py-2.5 text-[13.5px] border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-slate-50 hover:bg-white transition-colors"
              placeholder="clean_"
            />
          </div>
        </div>
      </div>

      <div className="p-5 md:p-6 border-t border-slate-100 bg-white/50 backdrop-blur">
        {isProcessing ? (
          <div className="bg-blue-50 rounded-xl p-4 border border-blue-100/50 text-center shadow-sm">
            <div className="flex items-center justify-center text-blue-600 mb-3">
              <svg className="animate-spin mr-2 h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span className="font-bold text-[15px]">Processing...</span>
            </div>
            <div className="w-full bg-blue-100/50 rounded-full h-2 mb-1.5 overflow-hidden">
              <div 
                className="bg-blue-500 h-full rounded-full transition-all duration-300 ease-out" 
                style={{ width: `${(progress.current / progress.total) * 100}%` }}
              ></div>
            </div>
            <p className="text-[12px] font-medium text-slate-500">
              {progress.current} of {progress.total} completed {progress.failed > 0 && <span className="text-red-500 font-semibold">({progress.failed} failed)</span>}
            </p>
          </div>
        ) : (
          <div className="flex flex-col space-y-3">
            {actionCount > 0 && (
              <button
                onClick={processAll}
                disabled={images.length === 0}
                className="w-full py-3.5 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold text-[16px] rounded-xl shadow-md shadow-blue-600/20 hover:shadow-lg hover:shadow-blue-600/30 transition-all flex items-center justify-center active:scale-[0.98]"
              >
                <PlayCircle className="w-5 h-5 mr-2" />
                Clean {images.length} Image{images.length !== 1 ? 's' : ''}
              </button>
            )}
            
            {completedCount > 0 && (
              <button
                onClick={downloadZip}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white py-3.5 px-4 rounded-xl font-bold text-[15px] shadow-md shadow-slate-900/10 transition-all flex items-center justify-center active:scale-[0.98]"
              >
                <Archive className="w-4 h-4 mr-2" />
                Download ZIP
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
