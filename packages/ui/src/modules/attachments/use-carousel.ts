import { useState } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';

/** The index `delta` steps from `index`, wrapping around a list of `length`. */
const step = (index: number, length: number, delta: number) =>
  (((Math.min(index, length - 1) + delta) % length) + length) % length;

/**
 * Which item of a lightbox is shown. The index stays inside the list as it shrinks, and
 * the arrow keys move it while the lightbox is open.
 */
export const useCarousel = (length: number, open: boolean) => {
  const [index, setIndex] = useState(0);

  const enabled = open && length > 0;

  useHotkeys('right', () => setIndex((i) => step(i, length, 1)), { enabled });
  useHotkeys('left', () => setIndex((i) => step(i, length, -1)), { enabled });

  return {
    index: Math.max(0, Math.min(index, length - 1)),
    show: setIndex,
    prev: () => setIndex((i) => step(i, length, -1)),
    next: () => setIndex((i) => step(i, length, 1)),
  };
};
