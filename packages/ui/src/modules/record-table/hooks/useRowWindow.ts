import { useCallback, useMemo, useRef, useSyncExternalStore } from 'react';

/** Rows rendered past each edge of the visible area when a new slice renders. */
const OVERSCAN = 40;

/**
 * A new slice renders once fewer than this many rendered rows are left past an edge of the
 * visible area. The browser scrolls on its own thread, ahead of the scroll events this hook
 * hears, so a slice that renders only once the visible rows have left it shows the empty gap
 * (and half-painted rows) on a fast scroll.
 */
const MARGIN = 20;

/** Rows rendered before the first measure: about one screen. */
const FIRST_RENDER = OVERSCAN;

const ROW_HEIGHT = 33;

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

/** The nearest ancestor that scrolls `element` vertically, or null when the page does. */
const scrollParentOf = (element: HTMLElement) => {
  for (let parent = element.parentElement; parent; parent = parent.parentElement) {
    const { overflowY } = getComputedStyle(parent);

    if (
      (overflowY === 'auto' || overflowY === 'scroll') &&
      parent.scrollHeight > parent.clientHeight
    ) {
      return parent;
    }
  }

  return null;
};

/** The top and height of the area `scroller` shows, in viewport coordinates. */
const visibleArea = (scroller: HTMLElement | null) => {
  if (!scroller) return { top: 0, height: window.innerHeight };

  return { top: scroller.getBoundingClientRect().top, height: scroller.clientHeight };
};

/**
 * The slice of rows `[start, end)` to render of a list of `count` rows of height
 * `--spacing-cell`, whose first row sits where `listStart` is, while its scroll container (or
 * the page) scrolls. Until `listStart` mounts, the first screen renders. The slice changes once
 * fewer than `MARGIN` rendered rows are left past an edge of the visible area, so a scroll
 * renders a new slice every `OVERSCAN - MARGIN` rows, while rows are still left to scroll into.
 */
export const useRowWindow = ({
  count,
  listStart,
}: {
  count: number;
  listStart: HTMLElement | null;
}) => {
  const rangeRef = useRef({ start: 0, end: FIRST_RENDER });
  // Measured once `listStart` mounts, when the gap rows already give the list its full height.
  const scroller = useMemo(() => listStart && scrollParentOf(listStart), [listStart]);

  // Read once, not on every scroll event: reading a computed style forces a style recalc.
  const rowHeight = useMemo(() => {
    if (!listStart) return ROW_HEIGHT;

    return (
      Number.parseFloat(getComputedStyle(listStart).getPropertyValue('--spacing-cell')) ||
      ROW_HEIGHT
    );
  }, [listStart]);

  const subscribe = useCallback(
    (onChange: () => void) => {
      const target = scroller ?? window;
      const resize = new ResizeObserver(onChange);

      target.addEventListener('scroll', onChange, { passive: true });
      window.addEventListener('resize', onChange);

      if (scroller) resize.observe(scroller);

      return () => {
        target.removeEventListener('scroll', onChange);
        window.removeEventListener('resize', onChange);
        resize.disconnect();
      };
    },
    [scroller],
  );

  const getSnapshot = () => {
    const current = rangeRef.current;

    if (!listStart) return current;

    const area = visibleArea(scroller);
    const top = listStart.getBoundingClientRect().top - area.top;
    const first = clamp(Math.floor(-top / rowHeight), 0, count);
    const last = clamp(Math.ceil((area.height - top) / rowHeight), 0, count);

    const topCovered = current.start === 0 || current.start <= first - MARGIN;
    const bottomCovered = current.end >= Math.min(last + MARGIN, count);

    if (topCovered && bottomCovered && current.end <= count) return current;

    rangeRef.current = {
      start: clamp(first - OVERSCAN, 0, count),
      end: clamp(last + OVERSCAN, 0, count),
    };

    return rangeRef.current;
  };

  const range = useSyncExternalStore(subscribe, getSnapshot);

  return { start: Math.min(range.start, count), end: Math.min(range.end, count) };
};
