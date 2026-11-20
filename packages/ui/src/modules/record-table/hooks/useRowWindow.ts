import { useCallback, useRef, useSyncExternalStore } from 'react';

/** Rows rendered past each edge of the viewport, so a normal scroll never shows a gap. */
const OVERSCAN = 15;

/** Rows rendered before the first measure: about one screen. */
const FIRST_RENDER = 2 * OVERSCAN;

const ROW_HEIGHT = 33;

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

/**
 * The slice of rows `[start, end)` to render while `viewport` scrolls a list of `count` rows of
 * height `--spacing-cell`, whose first row sits where `listStart` is. Without a viewport every row
 * renders. The slice changes only when the visible rows leave it, so a scroll renders a new
 * slice every `OVERSCAN` rows, and it renders before the next paint, so no gap shows.
 */
export const useRowWindow = ({
  count,
  viewport,
  listStart,
}: {
  count: number;
  viewport: HTMLElement | null;
  listStart: HTMLElement | null;
}) => {
  const rangeRef = useRef({ start: 0, end: FIRST_RENDER });

  const subscribe = useCallback(
    (onChange: () => void) => {
      if (!viewport) return () => undefined;

      const resize = new ResizeObserver(onChange);

      viewport.addEventListener('scroll', onChange, { passive: true });
      resize.observe(viewport);

      return () => {
        viewport.removeEventListener('scroll', onChange);
        resize.disconnect();
      };
    },
    [viewport],
  );

  const getSnapshot = () => {
    const current = rangeRef.current;

    if (!viewport || !listStart) return current;

    const rowHeight =
      Number.parseFloat(getComputedStyle(viewport).getPropertyValue('--spacing-cell')) ||
      ROW_HEIGHT;

    const top = listStart.getBoundingClientRect().top - viewport.getBoundingClientRect().top;
    const first = clamp(Math.floor(-top / rowHeight), 0, count);
    const last = clamp(Math.ceil((viewport.clientHeight - top) / rowHeight), 0, count);

    if (current.start <= first && current.end >= last && current.end <= count) return current;

    rangeRef.current = {
      start: clamp(first - OVERSCAN, 0, count),
      end: clamp(last + OVERSCAN, 0, count),
    };

    return rangeRef.current;
  };

  const range = useSyncExternalStore(subscribe, getSnapshot);

  if (!viewport) return { start: 0, end: count };

  return { start: Math.min(range.start, count), end: Math.min(range.end, count) };
};
