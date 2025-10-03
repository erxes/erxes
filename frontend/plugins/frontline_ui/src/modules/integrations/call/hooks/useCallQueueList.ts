import { QueryHookOptions, useQuery } from '@apollo/client';
import { CALL_QUEUE_LIST } from '../graphql/queries/callQueueList';

export const useCallQueueList = (
  options: QueryHookOptions<
    {
      callQueueList: {
        _id: string;
        name: string;
      }[];
    },
    {
      inboxId?: string;
    }
  >,
) => {
  const { data, loading, error, subscribeToMore } = useQuery(CALL_QUEUE_LIST, {
    ...options,
  });

  const { callQueueList } = data || {};

  return {
    callQueueList,
    loading,
    error,
    subscribeToMore,
  };
};
