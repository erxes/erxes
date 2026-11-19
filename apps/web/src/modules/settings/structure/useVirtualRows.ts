import { type RefObject, useSyncExternalStore } from 'react';

/** Rows drawn beyond each edge of the view, in pixels, so a quick scroll shows no gap. */
const OVERSCAN = 480;

/** The index of the first row that ends below `top`. */
const firstBelow = (starts: number[], heights: number[], top: number) => {
  let low = 0;
  let high = starts.length;

  while (low < high) {
    const middle = Math.floor((low + high) / 2);

    if ((starts[middle] ?? 0) + (heights[middle] ?? 0) <= top) low = middle + 1;
    else high = middle;
  }

  return low;
};

/**
 * Only the rows in view of `scroller`, for a long list whose rows have known heights. `list` is
 * the element the rows are placed in, inside `scroller`.
 */
export const useVirtualRows = (
  scroller: RefObject<HTMLElement | null>,
  list: RefObject<HTMLElement | null>,
  heights: number[],
) => {
  const subscribe = (notify: () => void) => {
    const element = scroller.current;

    if (!element) return () => undefined;

    const observer = new ResizeObserver(notify);

    element.addEventListener('scroll', notify, { passive: true });
    observer.observe(element);

    return () => {
      element.removeEventListener('scroll', notify);
      observer.disconnect();
    };
  };

  const top = useSyncExternalStore(
    subscribe,
    () => (scroller.current?.scrollTop ?? 0) - (list.current?.offsetTop ?? 0),
  );

  const height = useSyncExternalStore(subscribe, () => scroller.current?.clientHeight ?? 0);
  const starts: number[] = [];
  let total = 0;

  for (const rowHeight of heights) {
    starts.push(total);
    total += rowHeight;
  }

  const from = firstBelow(starts, heights, top - OVERSCAN);
  const end = top + (height || 1000) + OVERSCAN;
  const items: { index: number; start: number }[] = [];

  for (let index = from; index < heights.length && (starts[index] ?? 0) < end; index++)
    items.push({ index, start: starts[index] ?? 0 });

  return {
    items,
    total,
    scrollToIndex: (index: number) => {
      const element = scroller.current;
      const start = starts[index];
      const offset = list.current?.offsetTop ?? 0;

      if (element && start !== undefined)
        element.scrollTo({
          top: offset + start - element.clientHeight / 2 + (heights[index] ?? 0) / 2,
          behavior: 'smooth',
        });
    },
  };
};
