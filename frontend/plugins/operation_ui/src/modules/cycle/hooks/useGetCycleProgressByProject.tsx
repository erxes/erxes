import { useQuery } from '@apollo/client';
import { GET_CYCLE_PROGRESS_BY_PROJECT } from '@/cycle/graphql/queries/getCycleProgressByProject';
import { useRefetchOnTaskListChange } from '@/task/hooks/useRefetchOnTaskListChange';
import { useQueryState } from 'erxes-ui';

export const useGetCycleProgressByProject = (cycleId?: string | null) => {
  const [assignee] = useQueryState<string>('assignee');

  const { data, loading, refetch } = useQuery(GET_CYCLE_PROGRESS_BY_PROJECT, {
    variables: cycleId
      ? { _id: cycleId, assigneeId: assignee || undefined }
      : undefined,
    skip: !cycleId,
  });

  const cycleProgressByProject = data?.getCycleProgressByProject;

  useRefetchOnTaskListChange({
    filter: { cycleId },
    skip: !cycleId,
    refetch,
  });

  return { cycleProgressByProject, loading, refetch };
};
