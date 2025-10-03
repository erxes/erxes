import { CALL_QUEUE_INITIAL_LIST } from '@/integrations/call/graphql/queries/callConfigQueries';
import { useQuery } from '@apollo/client';

export const useCallQueueInitialList = ({
  integrationId,
  queue,
  setUpdatedAt,
}: {
  integrationId?: string;
  queue?: string;
  setUpdatedAt?: (updatedAt: Date) => void;
}) => {
  const { data, loading } = useQuery<{
    callQueueInitialList: string;
  }>(CALL_QUEUE_INITIAL_LIST, {
    variables: {
      integrationId: integrationId,
      queue: queue,
    },
    skip: !integrationId || !queue,
    fetchPolicy: 'cache-and-network',
    onCompleted: () => {
      setUpdatedAt?.(new Date());
    },
  });

  const { callQueueInitialList } = data || {};
  const jsonQueue = callQueueInitialList
    ? JSON.parse(callQueueInitialList)
    : {};
  return { callQueueInitialList: jsonQueue, loading };
};
