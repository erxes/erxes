import { useQuery, useSubscription } from '@apollo/client';
import { TASK_LIST_CHANGED } from '@/task/graphql/subscriptions/taskListChanged';
import { GET_PROJECT_PROGRESS } from '@/project/graphql/queries/getProjectProgress';

export const useGetProjectProgress = (projectId?: string | null) => {
  const { data, loading, refetch } = useQuery(GET_PROJECT_PROGRESS, {
    variables: projectId ? { _id: projectId } : undefined,
    skip: !projectId,
  });

  useSubscription(TASK_LIST_CHANGED, {
    variables: { filter: { projectId } },
    skip: !projectId,
    ignoreResults: true,
    onData: () => {
      refetch();
    },
  });

  const projectProgress = data?.getProjectProgress;

  return { projectProgress, loading, refetch };
};
