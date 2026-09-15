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
      return undefined;
    }

    const observer = new ResizeObserver(onResize);
    observer.observe(element);

    return () => observer.disconnect();
  }, [onResize, ref]);
};

// Property field grids render inside both wide sheets and narrow side panels,
// so only the element itself knows how much room it has. CSS container
// queries can't be used here: this tree sits inside a Radix ScrollArea, whose
// Viewport measures intrinsic content width via a `display: table` trick,
// and any descendant that establishes a query container (`container-type`)
// reports a 0 contribution to that measurement, collapsing the whole panel.
export const useNarrowWidth = <T extends HTMLElement>(
  maxWidth = 384,
): { ref: RefObject<T>; isNarrow: boolean } => {
  const ref = useRef<T>(null);
  const [isNarrow, setIsNarrow] = useState(false);

  const measure = useCallback(() => {
    const element = ref.current;

    if (element) {
      setIsNarrow(element.getBoundingClientRect().width < maxWidth);
    }
  }, [maxWidth]);

  // The observer only reports after paint.
  useLayoutEffect(measure, [measure]);
  useResizeEffect(ref, measure);

  return { ref, isNarrow };
};
