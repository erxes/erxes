import { useEffect, useRef } from 'react';

/** The next page of a list, as an infinite query has it. */
export type NextPage = {
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  fetchNextPage: () => unknown;
};

/**
 * Loads the next page when the list's end nears the scrolled box (200px early). Put the returned
 * ref on an empty element after the last row.
 */
export const useLoadOnScroll = (pages: NextPage | undefined) => {
  const sentinel = useRef<HTMLDivElement>(null);
  const { hasNextPage = false, isFetchingNextPage = false, fetchNextPage } = pages ?? {};

  useEffect(() => {
    const node = sentinel.current;

    if (!node || !hasNextPage || !fetchNextPage) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting && !isFetchingNextPage) void fetchNextPage();
      },
      { rootMargin: '200px' },
    );

    observer.observe(node);

    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  return sentinel;
};
