import { useQuery, useSubscription } from '@apollo/client';
import { TASK_LIST_CHANGED } from '@/task/graphql/subscriptions/taskListChanged';
import { GET_CYCLE_PROGRESS_BY_MEMBER } from '@/cycle/graphql/queries/getCycleProgressByMember';
import { useQueryState } from 'erxes-ui';

export const useGetCycleProgressByMember = (cycleId?: string | null) => {
  const [assignee] = useQueryState<string>('assignee');

  const { data, loading, refetch } = useQuery(GET_CYCLE_PROGRESS_BY_MEMBER, {
    variables: cycleId
      ? { _id: cycleId, assigneeId: assignee || undefined }
      : undefined,
    skip: !cycleId,
  });

  const cycleProgressByMember = data?.getCycleProgressByMember;

  useSubscription(TASK_LIST_CHANGED, {
    variables: {
      filter: { cycleId },
    },
    skip: !cycleId,
    ignoreResults: true,
    onData: () => {
      refetch();
    },
  });

  return { cycleProgressByMember, loading, refetch };
};
