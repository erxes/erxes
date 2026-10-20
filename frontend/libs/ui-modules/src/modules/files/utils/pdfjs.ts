type TPdfjs = typeof import('pdfjs-dist/legacy/build/pdf.mjs');

let pdfjs: Promise<TPdfjs> | null = null;

// Loaded on first PDF preview only; one worker is shared by every document.
export const loadPdfjs = () => {
  if (!pdfjs) {
    pdfjs = import('pdfjs-dist/legacy/build/pdf.mjs').then((lib) => {
      // Classic worker: Rspack emits worker chunks that load with importScripts.
      lib.GlobalWorkerOptions.workerPort = new Worker(
        new URL('../workers/pdf.worker.ts', import.meta.url),
      );

      return lib;
    });
  }

  return pdfjs;
};
