import { useApolloClient } from '@apollo/client';
import { useState } from 'react';

export interface IBulkRemoveResult {
  removedIds: string[];
  failedCount: number;
  error?: Error;
  refreshFailed: boolean;
}

/**
 * Removes many records with one mutation per id, since the API exposes no bulk
 * variant. Every id settles before reporting, so a failure in the middle never
 * hides the ids that did get removed.
 */
export const useBulkRemove = (refetchQueries: string[]) => {
  const client = useApolloClient();
  const [loading, setLoading] = useState(false);

  const bulkRemove = async (
    ids: string[],
    removeOne: (id: string) => Promise<unknown>,
  ): Promise<IBulkRemoveResult> => {
    setLoading(true);

    try {
      const results = await Promise.allSettled(ids.map(removeOne));

      const removedIds = ids.filter(
        (_, index) => results[index].status === 'fulfilled',
      );
      const rejected = results.filter(
        (result): result is PromiseRejectedResult =>
          result.status === 'rejected',
      );

      let refreshFailed = false;

      if (removedIds.length) {
        try {
          const refetched = await client.refetchQueries({
            include: refetchQueries,
          });
          refreshFailed = refetched.some(
            (result) => result.error || result.errors?.length,
          );
        } catch {
          refreshFailed = true;
        }
      }

      return {
        removedIds,
        failedCount: rejected.length,
        error: rejected[0]?.reason as Error | undefined,
        refreshFailed,
      };
    } finally {
      setLoading(false);
    }
  };

  return { bulkRemove, loading };
};
