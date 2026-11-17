import { useEffect, useRef, useState } from 'react';

export const useNarrowContainer = (enabled: boolean, maxWidth: number) => {
  const ref = useRef<HTMLDivElement>(null);
  const [isNarrow, setIsNarrow] = useState(enabled);

  useEffect(() => {
    const container = ref.current;
    if (!enabled || !container) return undefined;
    const observer = new ResizeObserver(([entry]) =>
      setIsNarrow(entry.contentRect.width < maxWidth),
    );
    observer.observe(container);
    return () => observer.disconnect();
  }, [enabled, maxWidth]);

  return { ref, isNarrow };
};
