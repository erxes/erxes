import { CALL_QUEUE_INITIAL_LIST } from '@/integrations/call/graphql/queries/callConfigQueries';
import { ICallQueueRealtimeSnapshot } from '@/integrations/call/types/callTypes';
import { useQuery } from '@apollo/client';
import { useMemo } from 'react';

export const useCallQueueInitialList = ({
  integrationId,
  queue,
  setUpdatedAt,
}: {
  integrationId?: string;
  queue?: string;
  setUpdatedAt?: (updatedAt: Date) => void;
}) => {
  const { data, loading } = useQuery(CALL_QUEUE_INITIAL_LIST, {
    variables: queue ? { queue } : undefined,
    skip: !integrationId || !queue,
    fetchPolicy: 'cache-and-network',
    onCompleted: () => {
      setUpdatedAt?.(new Date());
    },
  });

  const rawQueue = data?.callQueueInitialList;
  const jsonQueue = useMemo<Partial<ICallQueueRealtimeSnapshot>>(() => {
    if (!rawQueue) return {};
    try {
      return JSON.parse(rawQueue);
    } catch {
      return {};
    }
  }, [rawQueue]);
  return { callQueueInitialList: jsonQueue, loading };
};
