"use client";

import { AlertCircle, CheckCircle2, Download, Loader2, Trash2 } from 'lucide-react';
import { clsx } from 'clsx';
import Image from 'next/image';
import { twMerge } from 'tailwind-merge';
import { useInkWise } from '../../lib/store/InkWiseContext';

function formatBytes(bytes: number, decimals = 2) {
  if (!bytes) return '0 Bytes';

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
    <aside className="flex h-full w-full shrink-0 flex-col overflow-hidden border-r border-slate-200 bg-white md:w-80">
      <div className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-4">
        <h3 className="text-lg font-semibold text-slate-900">Queue ({images.length})</h3>
        <button
          type="button"
          onClick={clearAll}
          className="text-xs font-semibold text-red-600 transition-colors hover:text-red-700"
        >
          Clear All
        </button>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto bg-slate-50/80 p-3">
        {images.map((img) => (
          <div
            key={img.id}
            onClick={() => selectImage(img.id)}
            className={twMerge(
              clsx(
                "flex cursor-pointer items-center rounded-2xl border p-3 transition-all",
                selectedImageId === img.id
                  ? "border-emerald-500 bg-white shadow-sm ring-1 ring-emerald-500/70"
                  : "border-slate-200 bg-white hover:border-emerald-300"
              )
            )}
          >
            <div className="mr-3 flex h-16 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
              <Image
                src={img.thumbnailUrl}
                alt={img.name}
                width={48}
                height={64}
                unoptimized
                className="h-full w-full object-cover"
              />
            </div>

            <div className="mr-2 min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-slate-900" title={img.name}>
                {img.name}
              </p>
              <p className="truncate text-xs text-slate-500">{`${img.width} x ${img.height} | ${formatBytes(img.size)}`}</p>

              <div className="mt-1 flex items-center text-xs">
                {img.status === 'Ready' && <span className="text-slate-500">Ready</span>}
                {img.status === 'Processing' && (
                  <span className="flex items-center text-blue-600">
                    <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                    Processing
                  </span>
                )}
                {img.status === 'Completed' && (
                  <span className="flex items-center text-emerald-600">
                    <CheckCircle2 className="mr-1 h-3 w-3" />
                    Completed
                  </span>
                )}
                {img.status === 'Failed' && (
                  <span className="flex items-center text-red-600" title={img.error}>
                    <AlertCircle className="mr-1 h-3 w-3" />
                    Failed
                  </span>
                )}
              </div>
            </div>

            <div className="flex flex-col space-y-1">
              {img.status === 'Completed' && img.processedUrl && (
                <a
                  href={img.processedUrl}
                  download={getDownloadName(img.name)}
                  onClick={(event) => event.stopPropagation()}
                  className="rounded-md p-1.5 text-slate-400 transition-colors hover:bg-emerald-50 hover:text-emerald-600"
                  title="Download individual"
                >
                  <Download className="h-4 w-4" />
                </a>
              )}
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  removeImage(img.id);
                }}
                className="rounded-md p-1.5 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600"
                title="Remove from queue"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}
