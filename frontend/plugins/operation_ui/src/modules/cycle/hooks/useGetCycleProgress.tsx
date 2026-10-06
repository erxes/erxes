import { useQuery, useSubscription } from '@apollo/client';
import { TASK_LIST_CHANGED } from '@/task/graphql/subscriptions/taskListChanged';
import { GET_CYCLE_PROGRESS } from '@/cycle/graphql/queries/getCycleProgress';
import { useQueryState } from 'erxes-ui';

export const useGetCycleProgress = (cycleId?: string | null) => {
  const [assignee] = useQueryState<string>('assignee');

  const { data, loading, refetch } = useQuery(GET_CYCLE_PROGRESS, {
    variables: cycleId
      ? { _id: cycleId, assigneeId: assignee || undefined }
      : undefined,
    skip: !cycleId,
  });

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

  const cycleProgress = data?.getCycleProgress;

  return { cycleProgress, loading, refetch };
};
