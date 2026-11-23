import { createContext, use, useEffect, useState } from 'react';

const WIDE = 760;

export const CanvasContext = createContext<HTMLElement | null>(null);

export const useCanvas = () => use(CanvasContext);

export const useWide = () => {
  const [frame, setFrame] = useState<HTMLDivElement | null>(null);
  const [wide, setWide] = useState(false);

  useEffect(() => {
    if (!frame) return undefined;

    const watch = new ResizeObserver(([entry]) => {
      if (entry) setWide(entry.contentRect.width >= WIDE);
    });

    watch.observe(frame);

    return () => watch.disconnect();
  }, [frame]);

  return { setFrame, wide };
};
