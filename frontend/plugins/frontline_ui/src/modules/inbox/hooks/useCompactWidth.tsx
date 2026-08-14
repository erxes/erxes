import {
  RefObject,
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';

type CompactLevel = 0 | 1 | 2;

const useResizeEffect = (
  ref: RefObject<HTMLElement>,
  onResize: () => void,
): void => {
  useLayoutEffect(() => {
    const element = ref.current;

    if (!element) {
      return undefined;
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

// Collapse secondary actions before the assignee.
export const useOverflowCompact = <T extends HTMLElement>(): {
  ref: RefObject<T>;
  isCompact: boolean;
  compactLevel: CompactLevel;
} => {
  const ref = useRef<T>(null);
  const requiredWidths = useRef<[number, number]>([0, 0]);
  const compactLevelRef = useRef<CompactLevel>(0);
  const [compactLevel, setCompactLevel] = useState<CompactLevel>(0);

  const measure = useCallback(() => {
    const element = ref.current;

    if (!element) {
      return;
    }

    const level = compactLevelRef.current;
    let nextLevel = level;

    if (level === 0 && element.scrollWidth > element.clientWidth) {
      requiredWidths.current[0] = element.scrollWidth;
      nextLevel = 1;
    } else if (level === 1) {
      if (element.clientWidth >= requiredWidths.current[0]) {
        nextLevel = 0;
      } else if (element.scrollWidth > element.clientWidth) {
        requiredWidths.current[1] = element.scrollWidth;
        nextLevel = 2;
      }
    } else if (
      level === 2 &&
      element.clientWidth >= requiredWidths.current[1]
    ) {
      nextLevel = 1;
    }

    // Never dispatch while stable: this also runs on every render.
    if (nextLevel === level) {
      return;
    }

    compactLevelRef.current = nextLevel;
    setCompactLevel(nextLevel);
  }, []);

  // No dependency list: content can change without the element resizing.
  useLayoutEffect(measure);
  useResizeEffect(ref, measure);

  return { ref, isCompact: compactLevel > 0, compactLevel };
};
