import { useState } from 'react';

export const useAdjustRateFetchMore = ({
  loading,
  hasNextPage,
  endCursor,
  fetchNext,
}: {
  loading: boolean;
  hasNextPage?: boolean | null;
  endCursor?: string | null;
  fetchNext: (cursor: string) => Promise<unknown>;
}) => {
  const [failures, setFailures] = useState<Record<string, Error>>({});
  const fetchMoreError = endCursor ? failures[endCursor] : undefined;

  const loadNextPage = () => {
    if (loading || !hasNextPage || !endCursor) return;

    fetchNext(endCursor).catch((error: Error) =>
      setFailures((current) => ({ ...current, [endCursor]: error })),
    );
  };

  const handleFetchMore = () => {
    if (fetchMoreError) return;
    loadNextPage();
  };

  const retryFetchMore = () => {
    if (!endCursor) return;

    setFailures((current) => {
      const next = { ...current };
      delete next[endCursor];
      return next;
    });
    loadNextPage();
  };

  return { handleFetchMore, retryFetchMore, fetchMoreError };
};
