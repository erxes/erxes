import { useQuery, useSubscription } from '@apollo/client';
import { GET_PROJECT_PROGRESS_CHART } from '@/project/graphql/queries/getProjectProgressChart';
import { TASK_LIST_CHANGED } from '@/task/graphql/subscriptions/taskListChanged';

export const useGetProjectProgressChart = (projectId?: string | null) => {
  const { data, loading, refetch } = useQuery(GET_PROJECT_PROGRESS_CHART, {
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

  const getProjectProgressChart = data?.getProjectProgressChart;

  return { getProjectProgressChart, loading, refetch };
};
