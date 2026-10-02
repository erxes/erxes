import { GET_PROJECT_PROGRESS_BY_MILESTONE } from '@/project/graphql/queries/getProjectProgressByMilestone';
import { TASK_LIST_CHANGED } from '@/task/graphql/subscriptions/taskListChanged';
import { useQuery, useSubscription } from '@apollo/client';

export const useGetProjectProgressByMilestone = (projectId?: string | null) => {
  const { data, loading, refetch } = useQuery(
    GET_PROJECT_PROGRESS_BY_MILESTONE,
    {
      variables: projectId ? { projectId } : undefined,
      skip: !projectId,
    },
  );

  const projectProgressByMilestone = data?.milestoneProgress;

  useSubscription(TASK_LIST_CHANGED, {
    variables: { filter: { projectId } },
    skip: !projectId,
    ignoreResults: true,
    onData: () => {
      refetch();
    },
  });

  return { projectProgressByMilestone, loading, refetch };
};
