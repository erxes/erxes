import { useQuery } from '@apollo/client';
import { useRefetchOnTaskListChange } from '@/task/hooks/useRefetchOnTaskListChange';
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

  useRefetchOnTaskListChange({
    filter: { cycleId },
    skip: !cycleId,
    refetch,
  });

  const cycleProgress = data?.getCycleProgress;

  return { cycleProgress, loading, refetch };
};
