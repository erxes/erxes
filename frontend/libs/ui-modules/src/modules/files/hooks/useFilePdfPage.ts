import type {
  PDFDocumentProxy,
  RenderTask,
} from 'pdfjs-dist/legacy/build/pdf.mjs';
import { useEffect, useRef, useState } from 'react';
import { useInView } from 'react-intersection-observer';

const PAGE_RENDER_WIDTH = 900;

export const useFilePdfPage = (doc: PDFDocumentProxy, pageNumber: number) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [rendered, setRendered] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { ref, inView } = useInView({
    triggerOnce: true,
    rootMargin: '600px 0px',
  });

  useEffect(() => {
    const canvas = canvasRef.current;

    if (!inView || !canvas) {
      return;
    }

    let cancelled = false;
    let renderTask: RenderTask | null = null;

    doc
      .getPage(pageNumber)
      .then((page) => {
        if (cancelled) {
          return;
        }

        const base = page.getViewport({ scale: 1 });
        const scale =
          (PAGE_RENDER_WIDTH / base.width) * (window.devicePixelRatio || 1);
        const viewport = page.getViewport({ scale });

        canvas.width = Math.floor(viewport.width);
        canvas.height = Math.floor(viewport.height);
        renderTask = page.render({ canvas, viewport });

        return renderTask.promise;
      })
      .then(() => {
        if (!cancelled) {
          setRendered(true);
        }
      })
      .catch((e: Error) => {
        if (!cancelled && e.name !== 'RenderingCancelledException') {
          setError(e.message);
        }
      });

    return () => {
      cancelled = true;
      renderTask?.cancel();
    };
  }, [doc, pageNumber, inView]);

  return { ref, canvasRef, rendered, error };
};
