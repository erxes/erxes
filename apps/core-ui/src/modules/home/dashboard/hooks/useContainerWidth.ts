import { useEffect, useRef, useState } from 'react';

/** The element's content width, kept current as it resizes (0 until measured). */
export const useContainerWidth = <T extends HTMLElement>() => {
  const containerRef = useRef<T>(null);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const element = containerRef.current;

    if (!element) {
      return;
    }

    const observer = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width));

    observer.observe(element);
    setWidth(element.getBoundingClientRect().width);

    return () => observer.disconnect();
  }, []);

  return { containerRef, width, mounted: width > 0 };
};
