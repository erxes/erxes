import { QueryHookOptions, useQuery } from '@apollo/client';
import { GET_CYCLE_PROGRESS_CHART } from '@/cycle/graphql/queries/getCycleProgressChart';
import { useEffect } from 'react';
import { TASK_LIST_CHANGED } from '@/task/graphql/subscriptions/taskListChanged';
import { useQueryState } from 'erxes-ui';
export interface IGetCycleProgressChart {
  totalScope: number;
  chartData: {
    date: string;
    started: number;
    completed: number;
  }[];
}

interface IGetCycleQueryResponse {
  getCycleProgressChart: IGetCycleProgressChart;
}

export const useGetCycleProgressChart = (options: QueryHookOptions) => {
  const [assignee] = useQueryState<string>('assignee');

  const { data, loading, refetch, subscribeToMore } =
    useQuery<IGetCycleQueryResponse>(GET_CYCLE_PROGRESS_CHART, {
      ...options,
      variables: { ...options.variables, assigneeId: assignee },
    });

  const getCycleProgressChart = data?.getCycleProgressChart;

  useEffect(() => {
    const unsubscribe = subscribeToMore({
      document: TASK_LIST_CHANGED,
      variables: {
        filter: { cycleId: options.variables?._id },
      },
      updateQuery: () => {
        refetch();
      },
    });

    return () => {
      unsubscribe();
    };
  }, [options.variables?._id, subscribeToMore, refetch]);

  return { getCycleProgressChart, loading, refetch };
};
