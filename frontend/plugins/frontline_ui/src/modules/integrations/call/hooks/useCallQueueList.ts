import { QueryHookOptions, useQuery } from '@apollo/client';
import { CALL_QUEUE_LIST } from '../graphql/queries/callQueueList';

export interface ICallQueueListItem {
  queue: string;
  queuechairman: string;
  totalCalls: number;
  answeredCalls: number;
  abandonedCalls: number;
  abandonedRate: number;
  answeredRate: number;
  avgWait: number;
  avgTalk: number;
}

export const useCallQueueList = (
  options: QueryHookOptions<
    {
      callQueueList: ICallQueueListItem[];
    },
    {
      inboxId?: string;
    }
  >,
) => {
  const { data, loading, error, subscribeToMore } = useQuery(CALL_QUEUE_LIST, {
    ...options,
    skip: !options.variables?.inboxId,
  });

  const { callQueueList } = data || {};

  return {
    callQueueList,
    loading,
    error,
    subscribeToMore,
  };
};
