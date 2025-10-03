import { CALL_QUEUE_MEMBER_LIST } from '@/integrations/call/graphql/queries/callQueueMemberList';
import { useQuery } from '@apollo/client';

export interface CallQueueMemberList {
  queue: string;
  member: {
    member_extension: string;
    status: string;
    membership: string;
    answer: number;
    abandon: number;
    logintime: string;
    talktime: number;
    pausetime: string;
    first_name: string;
    last_name: string;
    pause_reason: string;
  }[];
}

export const useCallQueueMemberList = ({
  integrationId,
  queue,
  setUpdatedAt,
}: {
  integrationId?: string;
  queue?: string;
  setUpdatedAt?: (updatedAt: Date) => void;
}) => {
  const { data, loading } = useQuery<{
    callQueueMemberList: CallQueueMemberList;
  }>(CALL_QUEUE_MEMBER_LIST, {
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

  const { callQueueMemberList } = data || {};

  return { callQueueMemberList, loading };
};
