import { QueryHookOptions, useQuery } from '@apollo/client';
import { GET_PROJECT_PROGRESS_CHART } from '@/project/graphql/queries/getProjectProgressChart';
import { useEffect } from 'react';
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
  const { data, loading, refetch, subscribeToMore } =
    useQuery<IGetProjectQueryResponse>(GET_PROJECT_PROGRESS_CHART, options);

  const getProjectProgressChart = data?.getProjectProgressChart;

  useEffect(() => {
    const unsubscribe = subscribeToMore({
      document: TASK_LIST_CHANGED,
      variables: { filter: { projectId: options.variables?._id } },
      updateQuery: () => {
        refetch();
      },
    });

    return () => {
      unsubscribe();
    };
  }, [options.variables?._id, subscribeToMore, refetch]);

  return { getProjectProgressChart, loading, refetch };
};
