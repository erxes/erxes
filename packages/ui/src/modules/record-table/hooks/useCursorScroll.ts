import { useEffect, useLayoutEffect, useRef } from 'react';

/**
 * Keeps the scroll position steady while a cursor list loads pages: the list starts `offset`
 * pixels down when there is a previous page (so the backward skeleton is out of view), and
 * rows loaded above stay where they were on screen.
 */
export const useCursorScroll = ({
  dataLength,
  hasPreviousPage,
  offset,
}: {
  dataLength?: number;
  hasPreviousPage?: boolean;
  offset: number;
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  // Set while a backward page loads: the distance from the bottom and the row count before it.
  const backwardFetchRef = useRef<{ distanceFromBottom: number; dataLength?: number } | null>(null);

  useEffect(() => {
    if (scrollRef.current && hasPreviousPage !== undefined) {
      scrollRef.current.scrollTop = hasPreviousPage ? offset : 0;
    }
  }, [hasPreviousPage, offset]);

  useLayoutEffect(() => {
    const scroll = scrollRef.current;
    const pending = backwardFetchRef.current;

    if (!scroll || !pending || pending.dataLength === dataLength) return;

    scroll.scrollTop = scroll.scrollHeight - pending.distanceFromBottom;
    backwardFetchRef.current = null;
  }, [dataLength]);

  /** Remembers where the rows are before a backward page is loaded above them. */
  const startBackwardFetch = () => {
    const scroll = scrollRef.current;

    if (scroll) {
      backwardFetchRef.current = {
        distanceFromBottom: scroll.scrollHeight - scroll.scrollTop,
        dataLength,
      };
    }
  };

  return { scrollRef, startBackwardFetch };
};
