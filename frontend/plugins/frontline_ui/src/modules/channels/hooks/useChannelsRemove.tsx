import { useApolloClient, useMutation } from '@apollo/client';
import { useState } from 'react';
import { REMOVE_CHANNEL } from '../graphql/mutations';

export interface IChannelsRemoveResult {
  removedIds: string[];
  failedCount: number;
  error?: Error;
  refreshFailed: boolean;
}

export const useChannelsRemove = () => {
  const client = useApolloClient();
  const [removeChannel] = useMutation(REMOVE_CHANNEL);
  const [loading, setLoading] = useState(false);

  const removeChannels = async (
    channelIds: string[],
  ): Promise<IChannelsRemoveResult> => {
    setLoading(true);

    try {
      const results = await Promise.allSettled(
        channelIds.map((id) => removeChannel({ variables: { id } })),
      );

      const removedIds = channelIds.filter(
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
            include: ['GetChannels'],
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

  return { removeChannels, loading };
};
