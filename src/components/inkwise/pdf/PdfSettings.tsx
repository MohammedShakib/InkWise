"use client";

import { useInkWise } from '../../../lib/store/InkWiseContext';
import { PlayCircle, Settings2, SlidersHorizontal, FileText } from 'lucide-react';
import { InkWiseSettings } from '../../../lib/image-processing/types';

export default function PdfSettings({ onClean, numPages }: { onClean: () => void, numPages: number }) {
  const { 
    settings, 
    updateSettings,
    printSettings,
    updatePrintSettings,
    pdfSettings, 
    updatePdfSettings 
  } = useInkWise();

  const handlePreset = (preset: InkWiseSettings['preset']) => {
    switch (preset) {
      case 'Standard':
        updateSettings({ preset, whitePoint: 245, blackPoint: 0, gamma: 1 });
        break;
      case 'Light':
        updateSettings({ preset, whitePoint: 250, blackPoint: 0, gamma: 1 });
        break;
      case 'Strong':
        updateSettings({ preset, whitePoint: 235, blackPoint: 0, gamma: 1.1 });
        break;
      default:
        updateSettings({ preset });
    }
  };

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="p-5 md:p-6 border-b border-slate-100 flex items-center">
        <Settings2 className="w-5 h-5 text-slate-400 mr-2.5" />
        <h2 className="text-[16px] font-semibold text-slate-800 tracking-tight">PDF Options</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-5 md:p-6 space-y-8">
        
        {/* Cleaning Mode / Presets */}
        <div>
          <div className="flex items-center mb-4">
            <SparklesIcon className="w-4 h-4 text-slate-400 mr-2" />
            <h3 className="text-sm font-semibold text-slate-700">Cleaning Level</h3>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {(['Light', 'Standard', 'Strong', 'Custom'] as const).map(p => (
              <button
                key={p}
                onClick={() => handlePreset(p)}
                className={`py-2 text-[12px] font-bold rounded-lg border transition-all ${
                  settings.preset === p 
                    ? 'bg-blue-50 text-blue-700 border-blue-200 shadow-sm' 
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                {p}
              </button>
            ))}
          </div>

          {settings.preset === 'Custom' && (
            <div className="mt-4 p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-3">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <label className="font-medium text-slate-600">White Point</label>
                  <span className="text-blue-600 font-bold">{settings.whitePoint}</span>
                </div>
                <input 
                  type="range" min="200" max="255" value={settings.whitePoint}
                  onChange={(e) => updateSettings({ whitePoint: Number(e.target.value) })}
                  className="w-full accent-blue-600 h-1.5 bg-slate-200 rounded-full appearance-none cursor-pointer"
                />
              </div>
            </div>
          )}
        </div>

        <div className="h-px bg-slate-100 w-full"></div>

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
                <div className="w-5 h-5 rounded border border-slate-300 bg-white peer-checked:bg-blue-600 peer-checked:border-blue-600 transition-colors flex items-center justify-center">
                  {printSettings.grayscale && (
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                  )}
                </div>
              </div>
              <span className="ml-3 text-[13.5px] font-medium text-slate-600">Convert to Grayscale</span>
            </label>
          </div>
        </div>

        <div className="h-px bg-slate-100 w-full"></div>

        {/* PDF Settings */}
        <div className="space-y-5">
          <div>
            <label className="text-[13px] font-semibold text-slate-700 block mb-2.5">Render Quality (DPI)</label>
            <div className="flex space-x-2">
              {[200, 300, 450].map(dpi => (
                <button
                  key={dpi}
                  onClick={() => updatePdfSettings({ dpi })}
                  className={`flex-1 py-1.5 text-[12px] font-bold rounded-lg border transition-all ${
                    pdfSettings.dpi === dpi 
                      ? 'bg-blue-50 text-blue-700 border-blue-200 shadow-sm' 
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {dpi}
                </button>
              ))}
            </div>
            <p className="text-[11px] text-slate-500 mt-1.5">300 DPI is recommended for printing.</p>
          </div>

          <div>
            <label className="text-[13px] font-semibold text-slate-700 block mb-2.5">Image Format Quality</label>
            <div className="flex space-x-2">
              {(['high', 'balanced', 'small'] as const).map(q => (
                <button
                  key={q}
                  onClick={() => updatePdfSettings({ quality: q })}
                  className={`flex-1 py-1.5 text-[11px] font-bold rounded-lg border capitalize transition-all ${
                    pdfSettings.quality === q 
                      ? 'bg-blue-50 text-blue-700 border-blue-200 shadow-sm' 
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-[13px] font-semibold text-slate-700 block mb-2">Page Range</label>
            <input 
              type="text" 
              value={pdfSettings.pageRange}
              onChange={(e) => updatePdfSettings({ pageRange: e.target.value })}
              className="w-full px-3.5 py-2.5 text-[13.5px] border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-slate-50 hover:bg-white transition-colors"
              placeholder="e.g. 1-5, 8, 11-13"
            />
            <p className="text-[11px] text-slate-500 mt-1.5">Leave empty to clean all {numPages > 0 ? numPages : ''} pages.</p>
          </div>
        </div>
      </div>

      <div className="p-5 md:p-6 border-t border-slate-100 bg-white/50 backdrop-blur">
        <button
          onClick={onClean}
          className="w-full py-3.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-[16px] rounded-xl shadow-md shadow-blue-600/20 hover:shadow-lg hover:shadow-blue-600/30 transition-all flex items-center justify-center active:scale-[0.98]"
        >
          <PlayCircle className="w-5 h-5 mr-2" />
          Clean PDF
        </button>
      </div>
    </div>
  );
}

function SparklesIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
    </svg>
  );
}
