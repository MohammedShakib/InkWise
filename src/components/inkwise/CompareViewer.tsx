"use client";

import { useEffect, useState } from 'react';
import { CheckCircle2, Eye, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { useInkWise } from '../../lib/store/InkWiseContext';
import { applyLevels } from '../../lib/image-processing/levels';
import { applyGrayscale, flattenTransparency, increaseTextContrast } from '../../lib/image-processing/grayscale';
import { fileToImageData, imageDataToBlob } from '../../lib/image-processing/image-utils';

interface PreviewState {
  key: string;
  imageId: string;
  url: string;
}

export default function CompareViewer() {
  const { images, selectedImageId, settings, printSettings } = useInkWise();
  const selectedImage = images.find((img) => img.id === selectedImageId);
  const [preview, setPreview] = useState<PreviewState | null>(null);

  const currentPreviewKey = selectedImage
    ? [
        selectedImage.id,
        settings.blackPoint,
        settings.whitePoint,
        settings.gamma,
        Number(printSettings.grayscale),
        Number(printSettings.increaseTextContrast),
        Number(printSettings.flattenTransparency),
      ].join(':')
    : null;

  useEffect(() => {
    if (!selectedImage || !currentPreviewKey) return;

    let isCancelled = false;
    let nextPreviewUrl: string | null = null;

    const renderPreview = async () => {
      try {
        const imageData = await fileToImageData(selectedImage.file);

        if (printSettings.flattenTransparency) flattenTransparency(imageData.data);
        applyLevels(imageData.data, settings.blackPoint, settings.whitePoint, settings.gamma);
        if (printSettings.grayscale) applyGrayscale(imageData.data);
        if (printSettings.increaseTextContrast) increaseTextContrast(imageData.data);

        const blob = await imageDataToBlob(imageData, 'jpeg', 0.96);
        nextPreviewUrl = URL.createObjectURL(blob);

        if (!isCancelled) {
          setPreview((current) => {
            if (current?.url) {
              URL.revokeObjectURL(current.url);
            }

            return {
              key: currentPreviewKey,
              imageId: selectedImage.id,
              url: nextPreviewUrl!,
            };
          });
        }
      } finally {
        if (isCancelled && nextPreviewUrl) {
          URL.revokeObjectURL(nextPreviewUrl);
        }
      }
    };

    void renderPreview();

    return () => {
      isCancelled = true;
    };
  }, [currentPreviewKey, printSettings, selectedImage, settings]);

  useEffect(() => {
    return () => {
      if (preview?.url) {
        URL.revokeObjectURL(preview.url);
      }
    };
  }, [preview]);

  if (!selectedImage) return null;

  const previewUrl = preview?.key === currentPreviewKey && preview.imageId === selectedImage.id ? preview.url : null;
  const displayUrl = previewUrl ?? selectedImage.processedUrl ?? selectedImage.thumbnailUrl;
  const isProcessed = selectedImage.status === 'Completed' && Boolean(selectedImage.processedUrl);
  const isRenderingPreview = preview?.key !== currentPreviewKey;

  return (
    <section className="flex min-w-0 flex-1 flex-col overflow-hidden bg-slate-100/80">
      <div className="border-b border-slate-200 bg-white/92 px-5 py-4 backdrop-blur-sm md:px-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Current Output</p>
            <h2 className="truncate text-lg font-semibold text-slate-950 md:text-xl">{selectedImage.name}</h2>
            <p className="text-sm text-slate-500">
              {selectedImage.width} x {selectedImage.height} px
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-sm">
            <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-slate-600">
              <Eye className="h-4 w-4 text-blue-600" />
              Output only
            </span>
            <span
              className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 ${
                isProcessed
                  ? 'border border-emerald-200 bg-emerald-50 text-emerald-700'
                  : 'border border-amber-200 bg-amber-50 text-amber-700'
              }`}
            >
              {isRenderingPreview ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
              {isProcessed ? 'Processed result ready' : isRenderingPreview ? 'Refreshing preview' : 'Live preview'}
            </span>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4 md:p-8">
        <div className="mx-auto flex min-h-full max-w-5xl items-start justify-center rounded-[28px] border border-slate-200/80 bg-white p-4 shadow-[0_22px_60px_rgba(15,23,42,0.08)] md:p-8">
          <Image
            src={displayUrl}
            alt={`${selectedImage.name} output preview`}
            width={selectedImage.width}
            height={selectedImage.height}
            unoptimized
            sizes="(max-width: 768px) 100vw, 70vw"
            className="h-auto w-full max-w-full rounded-[20px] object-contain shadow-[0_10px_35px_rgba(15,23,42,0.08)]"
          />
        </div>
      </div>
    </section>
  );
}
