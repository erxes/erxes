import { QueryHookOptions, useQuery } from '@apollo/client';
import { BROADCAST_MESSAGE } from '../graphql/queries';
import { TBroadcastMessage } from '../types';

type TBroadcastMessageData = { engageMessageDetail?: TBroadcastMessage | null };

export const useBroadcastMessage = (
  options: QueryHookOptions<TBroadcastMessageData>,
) => {
  const { data, loading, error, refetch } = useQuery<TBroadcastMessageData>(
    BROADCAST_MESSAGE,
    options,
  );

  return {
    message: data?.engageMessageDetail ?? undefined,
    loading,
    error,
    refetch,
  };
};
