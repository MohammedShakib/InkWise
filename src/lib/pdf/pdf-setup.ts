import * as pdfjsLib from 'pdfjs-dist';

// We configure pdf.js to use the worker we copied to the public directory.
// This avoids complex bundler issues with Next.js Turbopack and ensures 
// it remains local (no CDN usage).
if (typeof window !== 'undefined' && !pdfjsLib.GlobalWorkerOptions.workerSrc) {
  pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
}

export { pdfjsLib };
