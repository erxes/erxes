import { useQuery } from '@apollo/client';
import { GET_CYCLE_PROGRESS_CHART } from '@/cycle/graphql/queries/getCycleProgressChart';
import { useRefetchOnTaskListChange } from '@/task/hooks/useRefetchOnTaskListChange';
import { useQueryState } from 'erxes-ui';

export const useGetCycleProgressChart = (cycleId?: string | null) => {
  const [assignee] = useQueryState<string>('assignee');

  const { data, loading, refetch } = useQuery(GET_CYCLE_PROGRESS_CHART, {
    variables: cycleId
      ? { _id: cycleId, assigneeId: assignee || undefined }
      : undefined,
    skip: !cycleId,
  });

  useRefetchOnTaskListChange({
    filter: { cycleId },
    skip: !cycleId,
    refetch,
  });

  const getCycleProgressChart = data?.getCycleProgressChart;

  return { getCycleProgressChart, loading, refetch };
};
