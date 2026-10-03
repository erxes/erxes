import { QueryHookOptions, useQuery, useSubscription } from '@apollo/client';
import { GET_CYCLE_PROGRESS_CHART } from '@/cycle/graphql/queries/getCycleProgressChart';
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

  const { data, loading, refetch } = useQuery<IGetCycleQueryResponse>(
    GET_CYCLE_PROGRESS_CHART,
    {
      ...options,
      variables: { ...options.variables, assigneeId: assignee },
    },
  );

  const getCycleProgressChart = data?.getCycleProgressChart;

  useSubscription(TASK_LIST_CHANGED, {
    variables: {
      filter: { cycleId: options.variables?._id },
    },
    ignoreResults: true,
    onData: () => {
      refetch();
    },
  });

  return { getCycleProgressChart, loading, refetch };
};
