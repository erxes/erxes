import { useQuery, useSubscription } from '@apollo/client';
import { GET_CYCLE_PROGRESS_BY_PROJECT } from '@/cycle/graphql/queries/getCycleProgressByProject';
import { TASK_LIST_CHANGED } from '@/task/graphql/subscriptions/taskListChanged';
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

  useSubscription(TASK_LIST_CHANGED, {
    variables: { filter: { cycleId } },
    skip: !cycleId,
    ignoreResults: true,
    onData: () => {
      refetch();
    },
  });

  return { cycleProgressByProject, loading, refetch };
};
