import { pdfjsLib } from './pdf-setup';
import { PDFDocument } from 'pdf-lib';
import { getWorkerPool } from '../image-processing/worker-client';
import { InkWiseSettings, PrintSettings } from '../image-processing/types';
import { parsePageRange } from './page-range';

export interface PdfProcessingOptions {
  file: File;
  settings: InkWiseSettings;
  printSettings: PrintSettings;
  dpi: number;
  quality: 'high' | 'balanced' | 'small';
  pageRange: string;
  onProgress: (state: PdfProcessingState) => void;
  signal?: AbortSignal;
}

export interface PdfProcessingState {
  status: 'idle' | 'loading' | 'processing' | 'building' | 'completed' | 'error' | 'cancelled';
  currentPage: number;
  totalPages: number;
  completed: number;
  failed: number;
  errorMsg?: string;
  blob?: Blob;
}

const DPI_TO_SCALE = 72; // PDF standard points per inch

export async function processPdf(options: PdfProcessingOptions): Promise<void> {
  const { file, settings, printSettings, dpi, quality, pageRange, onProgress, signal } = options;

  let state: PdfProcessingState = {
    status: 'loading',
    currentPage: 0,
    totalPages: 0,
    completed: 0,
    failed: 0,
  };

  const updateState = (updates: Partial<PdfProcessingState>) => {
    state = { ...state, ...updates };
    onProgress(state);
  };

  try {
    updateState({ status: 'loading' });

    // 1. Load original PDF bytes
    const arrayBuffer = await file.arrayBuffer();
    if (signal?.aborted) throw new Error('Cancelled');

    // 2. Parse with pdf-lib to rebuild/copy unselected pages
    const originalPdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
    
    // 3. Parse with pdf.js to render raster pages
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    
    state.totalPages = pdf.numPages;
    updateState({ totalPages: pdf.numPages });

    const targetPages = parsePageRange(pageRange, pdf.numPages);
    
    // 4. Create new Output PDF
    const newPdfDoc = await PDFDocument.create();

    const workerPool = getWorkerPool();

    updateState({ status: 'processing' });

    for (let i = 1; i <= pdf.numPages; i++) {
      if (signal?.aborted) {
        updateState({ status: 'cancelled' });
        return;
      }

      updateState({ currentPage: i });

      // If page is not in range, just copy it natively via pdf-lib
      if (!targetPages.includes(i)) {
        try {
          const [copiedPage] = await newPdfDoc.copyPages(originalPdfDoc, [i - 1]);
          newPdfDoc.addPage(copiedPage);
          updateState({ completed: state.completed + 1 });
        } catch (e) {
          console.error(`Failed to copy page ${i}`, e);
          updateState({ failed: state.failed + 1 });
        }
        continue;
      }

      // Process page via InkWise Pipeline
      try {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: dpi / DPI_TO_SCALE });

        // Render PDF page to canvas
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (!ctx) throw new Error('No 2d context');

        canvas.width = viewport.width;
        canvas.height = viewport.height;

        // Ensure background is white before rendering
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        await page.render({
          canvasContext: ctx,
          viewport: viewport,
          background: 'white', // Ensure transparent areas become white
        } as any).promise;

        if (signal?.aborted) throw new Error('Cancelled');

        // Extract image data
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

        // Process through worker
        const result = await workerPool.processImage({
          id: `pdf-page-${i}`,
          imageData,
          settings,
          printSettings,
        });

        if (result.error || !result.imageData) {
          throw new Error(result.error || 'Worker processing failed');
        }

        if (signal?.aborted) throw new Error('Cancelled');

        // Draw processed imageData back to canvas
        ctx.putImageData(result.imageData, 0, 0);

        // Convert canvas to buffer based on quality
        let imageBytes: Uint8Array;
        if (quality === 'high') {
          // Lossless PNG for highest quality
          const dataUrl = canvas.toDataURL('image/png');
          const res = await fetch(dataUrl);
          const buf = await res.arrayBuffer();
          imageBytes = new Uint8Array(buf);
        } else {
          // JPEG for balanced/small
          const jpegQuality = quality === 'balanced' ? 0.92 : 0.85;
          const dataUrl = canvas.toDataURL('image/jpeg', jpegQuality);
          const res = await fetch(dataUrl);
          const buf = await res.arrayBuffer();
          imageBytes = new Uint8Array(buf);
        }

        // Embed into new pdf
        let pdfImage;
        if (quality === 'high') {
          pdfImage = await newPdfDoc.embedPng(imageBytes);
        } else {
          pdfImage = await newPdfDoc.embedJpg(imageBytes);
        }

        // Create a new blank page in pdf-lib that matches original dimensions
        // Note: pdf-lib uses points (72 per inch), so we use the unscaled viewport
        const originalViewport = page.getViewport({ scale: 1.0 });
        const newPage = newPdfDoc.addPage([originalViewport.width, originalViewport.height]);

        // Draw the image exactly filling the page
        newPage.drawImage(pdfImage, {
          x: 0,
          y: 0,
          width: originalViewport.width,
          height: originalViewport.height,
        });

        // Memory cleanup
        canvas.width = 0;
        canvas.height = 0;
        page.cleanup();

        updateState({ completed: state.completed + 1 });
      } catch (err) {
        if (err instanceof Error && err.message === 'Cancelled') {
          updateState({ status: 'cancelled' });
          return;
        }
        console.error(`Failed to process page ${i}`, err);
        updateState({ failed: state.failed + 1 });
      }
    }

    if (signal?.aborted) {
      updateState({ status: 'cancelled' });
      return;
    }

    // 5. Finalize PDF
    updateState({ status: 'building' });
    const pdfBytes = await newPdfDoc.save();
    const outputBlob = new Blob([pdfBytes as any], { type: 'application/pdf' });
    
    updateState({ status: 'completed', blob: outputBlob });

  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error';
    if (errorMsg === 'Cancelled' || signal?.aborted) {
      updateState({ status: 'cancelled' });
    } else {
      updateState({ status: 'error', errorMsg });
    }
  }
}
