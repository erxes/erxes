import { useQuery, useSubscription } from '@apollo/client';
import { GET_CYCLE_PROGRESS_CHART } from '@/cycle/graphql/queries/getCycleProgressChart';
import { TASK_LIST_CHANGED } from '@/task/graphql/subscriptions/taskListChanged';
import { useQueryState } from 'erxes-ui';

export const useGetCycleProgressChart = (cycleId?: string | null) => {
  const [assignee] = useQueryState<string>('assignee');

  const { data, loading, refetch } = useQuery(GET_CYCLE_PROGRESS_CHART, {
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

  const getCycleProgressChart = data?.getCycleProgressChart;

  return { getCycleProgressChart, loading, refetch };
};
