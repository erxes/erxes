import { useEffect, useRef, useState } from 'react';

const SAFE_HREF = /^(https?:|mailto:|#)/i;

// docx-preview copies link targets from the file as they are.
const dropUnsafeLinks = (root: HTMLElement) => {
  root.querySelectorAll('a[href]').forEach((link) => {
    if (!SAFE_HREF.test(link.getAttribute('href') || '')) {
      link.removeAttribute('href');
    }
  });
};

export const useFileDocxPreview = (url: string) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    let cancelled = false;

    setLoading(true);
    setError(null);

    Promise.all([
      import('docx-preview'),
      fetch(url, { signal: controller.signal }).then((res) => {
        if (!res.ok) {
          throw new Error(`Storage returned ${res.status}`);
        }

        return res.blob();
      }),
    ])
      .then(async ([{ renderAsync }, blob]) => {
        // Rendered off-DOM so a superseded render never shows.
        const target = document.createElement('div');

        // Alt chunks are raw HTML embedded in the document.
        await renderAsync(blob, target, undefined, {
          renderAltChunks: false,
          ignoreLastRenderedPageBreak: true,
        });

        if (cancelled || !containerRef.current) {
          return;
        }

        dropUnsafeLinks(target);
        containerRef.current.replaceChildren(target);
        setLoading(false);
      })
      .catch((e: Error) => {
        if (!cancelled && e.name !== 'AbortError') {
          setError(e.message);
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [url]);

  return { containerRef, loading, error };
};
