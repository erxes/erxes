import type {
  PDFDocumentLoadingTask,
  PDFDocumentProxy,
} from 'pdfjs-dist/legacy/build/pdf.mjs';
import { useEffect, useState } from 'react';
import { loadPdfjs } from '../utils/pdfjs';

// Measured: 64 KB chunks open object-stream PDFs in the fewest range reads.
const PDF_RANGE_CHUNK = 64 * 1024;

export const useFilePdfPreview = (url: string) => {
  const [doc, setDoc] = useState<PDFDocumentProxy | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    let task: PDFDocumentLoadingTask | null = null;

    setDoc(null);
    setError(null);

    loadPdfjs()
      .then((pdfjs) => {
        if (cancelled) {
          return null;
        }

        task = pdfjs.getDocument({
          url,
          rangeChunkSize: PDF_RANGE_CHUNK,
          disableAutoFetch: true,
          disableStream: true,
        });

        return task.promise;
      })
      .then((loaded) => {
        if (!cancelled && loaded) {
          setDoc(loaded);
        }
      })
      .catch((e: Error) => {
        if (!cancelled) {
          setError(e.message);
        }
      });

    return () => {
      cancelled = true;
      task?.destroy();
    };
  }, [url]);

  return {
    doc,
    pageNumbers: doc
      ? Array.from({ length: doc.numPages }, (_, i) => i + 1)
      : [],
    loading: !doc && !error,
    error,
  };
};
