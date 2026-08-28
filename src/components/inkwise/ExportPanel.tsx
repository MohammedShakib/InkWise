"use client";

import { useState } from 'react';
import { useInkWise } from '../../lib/store/InkWiseContext';
import { Download, PlayCircle, Archive } from 'lucide-react';
import JSZip from 'jszip';
import { getWorkerPool } from '../../lib/image-processing/worker-client';
import { fileToImageData, imageDataToBlob } from '../../lib/image-processing/image-utils';

export default function ExportPanel() {
  const { images, exportSettings, updateExportSettings, settings, printSettings, updateImageStatus } = useInkWise();
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0, failed: 0 });

  const processAll = async () => {
    const toProcess = images.filter(img => img.status === 'Ready' || img.status === 'Failed');
    if (toProcess.length === 0) return;

    setIsProcessing(true);
    setProgress({ current: 0, total: toProcess.length, failed: 0 });

    const pool = getWorkerPool();

    const promises = toProcess.map(async (img) => {
      try {
        updateImageStatus(img.id, { status: 'Processing' });
        
        // Decode full image
        const imageData = await fileToImageData(img.file);
        
        // Process in worker
        const result = await pool.processImage({
          id: img.id,
          imageData,
          settings,
          printSettings
        });

        if (result.error || !result.imageData) {
          throw new Error(result.error || 'No image data returned');
        }

        // Encode to blob
        const blob = await imageDataToBlob(result.imageData, exportSettings.format, exportSettings.quality);
        const processedUrl = URL.createObjectURL(blob);

        updateImageStatus(img.id, { 
          status: 'Completed', 
          processedBlob: blob, 
          processedUrl,
          analysisBefore: result.analysisBefore,
          analysisAfter: result.analysisAfter
        });
        
        setProgress(p => ({ ...p, current: p.current + 1 }));
      } catch (err: any) {
        updateImageStatus(img.id, { status: 'Failed', error: err.message });
        setProgress(p => ({ ...p, failed: p.failed + 1, current: p.current + 1 }));
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
      const finalName = `${name}${exportSettings.suffix}.${ext}`;
      
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

  const readyCount = images.filter(i => i.status === 'Ready' || i.status === 'Failed').length;
  const completedCount = images.filter(i => i.status === 'Completed').length;

  return (
    <div className="p-5 border-t border-gray-100 bg-white shadow-[0_-4px_10px_rgba(0,0,0,0.02)]">
      <div className="space-y-4 mb-5">
        <div>
          <label className="text-xs font-medium text-gray-700 block mb-1">Output Format</label>
          <div className="flex space-x-2">
            {(['png', 'jpeg', 'webp'] as const).map(fmt => (
              <button
                key={fmt}
                onClick={() => updateExportSettings({ format: fmt })}
                className={`flex-1 py-1.5 text-xs font-medium rounded border transition-colors ${
                  exportSettings.format === fmt 
                    ? 'bg-gray-900 text-white border-gray-900' 
                    : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                }`}
              >
                {fmt.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
        
        {exportSettings.format !== 'png' && (
          <div>
            <div className="flex justify-between text-xs mb-1">
              <label className="font-medium text-gray-700">Quality</label>
              <span className="text-gray-500">{Math.round(exportSettings.quality * 100)}%</span>
            </div>
            <input 
              type="range" min="0.1" max="1.0" step="0.05" value={exportSettings.quality}
              onChange={(e) => updateExportSettings({ quality: Number(e.target.value) })}
              className="w-full accent-gray-900"
            />
          </div>
        )}

        <div>
          <label className="text-xs font-medium text-gray-700 block mb-1">Filename Suffix</label>
          <input 
            type="text" 
            value={exportSettings.suffix}
            onChange={(e) => updateExportSettings({ suffix: e.target.value })}
            className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-emerald-500"
            placeholder="_clean"
          />
        </div>
      </div>

      {isProcessing ? (
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-100 text-center">
          <div className="flex items-center justify-center text-emerald-600 mb-2">
            <PlayCircle className="w-5 h-5 mr-2 animate-pulse" />
            <span className="font-semibold">Processing...</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 mb-1">
            <div 
              className="bg-emerald-500 h-2 rounded-full transition-all duration-300" 
              style={{ width: `${(progress.current / progress.total) * 100}%` }}
            ></div>
          </div>
          <p className="text-xs text-gray-500">
            {progress.current} of {progress.total} completed {progress.failed > 0 && <span className="text-red-500">({progress.failed} failed)</span>}
          </p>
        </div>
      ) : (
        <div className="flex space-x-3">
          {readyCount > 0 && (
            <button
              onClick={processAll}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 px-4 rounded-lg font-medium shadow-sm transition-colors flex items-center justify-center text-sm"
            >
              <PlayCircle className="w-4 h-4 mr-2" />
              Process {readyCount} Image{readyCount !== 1 && 's'}
            </button>
          )}
          
          {completedCount > 0 && (
            <button
              onClick={downloadZip}
              className="flex-1 bg-gray-900 hover:bg-black text-white py-2.5 px-4 rounded-lg font-medium shadow-sm transition-colors flex items-center justify-center text-sm"
            >
              <Archive className="w-4 h-4 mr-2" />
              Download ZIP
            </button>
          )}
        </div>
      )}
    </div>
  );
}
