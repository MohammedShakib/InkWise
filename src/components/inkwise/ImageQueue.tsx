"use client";

import { useInkWise } from '../../lib/store/InkWiseContext';
import { Trash2, CheckCircle2, AlertCircle, Loader2, Download } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function formatBytes(bytes: number, decimals = 2) {
  if (!+bytes) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

export default function ImageQueue() {
  const { images, selectedImageId, selectImage, removeImage, clearAll, exportSettings } = useInkWise();

  if (images.length === 0) return null;

  const getDownloadName = (originalName: string) => {
    const extIdx = originalName.lastIndexOf('.');
    if (extIdx === -1) return `${originalName}${exportSettings.suffix}.${exportSettings.format}`;
    const name = originalName.slice(0, extIdx);
    const ext = exportSettings.format === 'jpeg' ? 'jpg' : exportSettings.format;
    return `${name}${exportSettings.suffix}.${ext}`;
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 border-r border-gray-100 overflow-hidden w-full md:w-80 shrink-0">
      <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-white">
        <h3 className="font-semibold text-gray-800">Queue ({images.length})</h3>
        <button 
          onClick={clearAll}
          className="text-xs text-red-600 hover:text-red-700 font-medium"
        >
          Clear All
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {images.map(img => (
          <div 
            key={img.id}
            onClick={() => selectImage(img.id)}
            className={twMerge(
              clsx(
                "flex items-center p-2 rounded-lg cursor-pointer transition-all border",
                selectedImageId === img.id 
                  ? "bg-white border-emerald-500 shadow-sm ring-1 ring-emerald-500" 
                  : "bg-white border-gray-200 hover:border-emerald-300"
              )
            )}
          >
            <div className="w-12 h-16 rounded overflow-hidden bg-gray-100 shrink-0 border border-gray-100 mr-3 flex items-center justify-center">
              <img src={img.thumbnailUrl} alt={img.name} className="object-cover w-full h-full" />
            </div>
            
            <div className="flex-1 min-w-0 mr-2">
              <p className="text-sm font-medium text-gray-900 truncate" title={img.name}>{img.name}</p>
              <p className="text-xs text-gray-500 truncate">{img.width}×{img.height} • {formatBytes(img.size)}</p>
              
              <div className="mt-1 flex items-center text-xs">
                {img.status === 'Ready' && <span className="text-gray-500">Ready</span>}
                {img.status === 'Processing' && <span className="text-blue-600 flex items-center"><Loader2 className="w-3 h-3 animate-spin mr-1"/> Processing</span>}
                {img.status === 'Completed' && <span className="text-emerald-600 flex items-center"><CheckCircle2 className="w-3 h-3 mr-1"/> Completed</span>}
                {img.status === 'Failed' && <span className="text-red-600 flex items-center" title={img.error}><AlertCircle className="w-3 h-3 mr-1"/> Failed</span>}
              </div>
            </div>
            
            <div className="flex flex-col space-y-1">
              {img.status === 'Completed' && img.processedUrl && (
                <a 
                  href={img.processedUrl} 
                  download={getDownloadName(img.name)}
                  onClick={(e) => e.stopPropagation()}
                  className="p-1.5 text-gray-400 hover:text-emerald-600 rounded-md hover:bg-emerald-50"
                  title="Download individual"
                >
                  <Download className="w-4 h-4" />
                </a>
              )}
              <button 
                onClick={(e) => { e.stopPropagation(); removeImage(img.id); }}
                className="p-1.5 text-gray-400 hover:text-red-600 rounded-md hover:bg-red-50"
                title="Remove from queue"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
