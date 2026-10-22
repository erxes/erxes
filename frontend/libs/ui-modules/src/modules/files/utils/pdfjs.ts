type TPdfjs = typeof import('pdfjs-dist/legacy/build/pdf.mjs');

let pdfjs: Promise<TPdfjs> | null = null;

export const loadPdfjs = () => {
  if (!pdfjs) {
    pdfjs = import('pdfjs-dist/legacy/build/pdf.mjs').then((lib) => {
      // Classic worker: Rspack emits importScripts chunks.
      lib.GlobalWorkerOptions.workerPort = new Worker(
        new URL('../workers/pdf.worker.ts', import.meta.url),
      );

      return lib;
    });
  }

  return pdfjs;
};
