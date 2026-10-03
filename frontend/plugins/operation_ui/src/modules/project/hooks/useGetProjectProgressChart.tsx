import { QueryHookOptions, useQuery, useSubscription } from '@apollo/client';
import { GET_PROJECT_PROGRESS_CHART } from '@/project/graphql/queries/getProjectProgressChart';
import { TASK_LIST_CHANGED } from '@/task/graphql/subscriptions/taskListChanged';

interface IGetProjectQueryResponse {
  getProjectProgressChart: {
    totalScope: number;
    chartData: {
      date: string;
      started: number;
      completed: number;
    }[];
  };
}

export const useGetProjectProgressChart = (options: QueryHookOptions) => {
  const { data, loading, refetch } = useQuery<IGetProjectQueryResponse>(
    GET_PROJECT_PROGRESS_CHART,
    options,
  );

  const getProjectProgressChart = data?.getProjectProgressChart;

  useSubscription(TASK_LIST_CHANGED, {
    variables: { filter: { projectId: options.variables?._id } },
    ignoreResults: true,
    onData: () => {
      refetch();
    },
  });

  return { getProjectProgressChart, loading, refetch };
};
