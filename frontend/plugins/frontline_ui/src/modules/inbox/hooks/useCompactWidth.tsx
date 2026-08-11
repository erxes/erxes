import {
  RefObject,
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';

const useResizeEffect = (
  ref: RefObject<HTMLElement>,
  onResize: () => void,
): void => {
  useLayoutEffect(() => {
    const element = ref.current;

    if (!element) {
      return;
    }

    const observer = new ResizeObserver(onResize);
    observer.observe(element);

    return () => observer.disconnect();
  }, [onResize, ref]);
};

// Inbox columns are resizable, so only the element knows how much room it has.
export const useCompactWidth = <T extends HTMLElement>(
  maxWidth: number,
): { ref: RefObject<T>; isCompact: boolean } => {
  const ref = useRef<T>(null);
  const [isCompact, setIsCompact] = useState(false);

  const measure = useCallback(() => {
    const element = ref.current;

    if (element) {
      setIsCompact(element.getBoundingClientRect().width < maxWidth);
    }
  }, [maxWidth]);

  // The observer only reports after paint.
  useLayoutEffect(measure, [measure]);
  useResizeEffect(ref, measure);

  return { ref, isCompact };
};

// Collapses on real overflow instead of a guessed breakpoint, and expands again
// only once the width the full content needed is available, so it cannot flap.
export const useOverflowCompact = <T extends HTMLElement>(): {
  ref: RefObject<T>;
  isCompact: boolean;
} => {
  const ref = useRef<T>(null);
  const requiredWidth = useRef(0);
  const compactRef = useRef(false);
  const [isCompact, setIsCompact] = useState(false);

  const measure = useCallback(() => {
    const element = ref.current;

    if (!element) {
      return;
    }

    const compact = compactRef.current;
    const next = compact
      ? element.clientWidth < requiredWidth.current
      : element.scrollWidth > element.clientWidth;

    if (!compact && next) {
      requiredWidth.current = element.scrollWidth;
    }

    // Never dispatch while stable: this also runs on every render.
    if (next === compact) {
      return;
    }

    compactRef.current = next;
    setIsCompact(next);
  }, []);

  // No dependency list: content can change without the element resizing.
  useLayoutEffect(measure);
  useResizeEffect(ref, measure);

  return { ref, isCompact };
};
