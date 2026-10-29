import { useQuery } from '@apollo/client';
import { useRefetchOnTaskListChange } from '@/task/hooks/useRefetchOnTaskListChange';
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

  useRefetchOnTaskListChange({
    filter: { cycleId },
    skip: !cycleId,
    refetch,
  });

  return { cycleProgressByMember, loading, refetch };
};
