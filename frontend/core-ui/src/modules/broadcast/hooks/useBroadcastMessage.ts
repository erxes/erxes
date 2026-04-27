import { QueryHookOptions, useQuery } from '@apollo/client';
import { BROADCAST_MESSAGE } from '../graphql/queries';

export const useBroadcastMessage = (options: QueryHookOptions) => {
  const { data, loading } = useQuery(BROADCAST_MESSAGE, options);

  return { message: data?.engageMessageDetail || {}, loading };
};
