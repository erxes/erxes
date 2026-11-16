import { useState } from 'react';

type TFetchMoreFailure = {
  cursor: string;
  error: Error;
};

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
  const [failure, setFailure] = useState<TFetchMoreFailure>();
  const fetchMoreError =
    failure && failure.cursor === endCursor ? failure.error : undefined;

  const loadNextPage = () => {
    if (loading || !hasNextPage || !endCursor) return;

    fetchNext(endCursor).catch((error: Error) =>
      setFailure({ cursor: endCursor, error }),
    );
  };

  const handleFetchMore = () => {
    if (fetchMoreError) return;
    loadNextPage();
  };

  const retryFetchMore = () => {
    setFailure(undefined);
    loadNextPage();
  };

  return { handleFetchMore, retryFetchMore, fetchMoreError };
};
