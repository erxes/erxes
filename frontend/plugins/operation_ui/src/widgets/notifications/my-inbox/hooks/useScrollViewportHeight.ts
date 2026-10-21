import { useEffect, useRef, useState } from 'react';
import type { ScrollViewportHeight } from '~/widgets/notifications/my-inbox/types/notificationContent';

const SCROLL_VIEWPORT_SELECTOR = '[data-radix-scroll-area-viewport]';

export const useScrollViewportHeight = (): ScrollViewportHeight => {
  const ref = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState<number>();

  useEffect(() => {
    const viewport = ref.current?.closest(SCROLL_VIEWPORT_SELECTOR);

    if (!viewport) {
      return;
    }

    const observer = new ResizeObserver(() => setHeight(viewport.clientHeight));

    observer.observe(viewport);

    return () => observer.disconnect();
  }, []);

  return { ref, height };
};
