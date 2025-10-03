import { QueryHookOptions, useQuery } from '@apollo/client';
import { TASK_LIST_CHANGED } from '@/task/graphql/subscriptions/taskListChanged';
import { IProjectProgress } from '@/project/types';
import { GET_CYCLE_PROGRESS } from '@/cycle/graphql/queries/getCycleProgress';
import { useEffect } from 'react';
import { useQueryState } from 'erxes-ui';

interface IGetCycleQueryResponse {
  getCycleProgress: IProjectProgress;
}

interface IGetCycleQueryVariables {
  _id?: string;
  assigneeId?: string;
}

export const useGetCycleProgress = (
  options: QueryHookOptions<IGetCycleQueryResponse, IGetCycleQueryVariables>,
) => {
  const [assignee] = useQueryState<string>('assignee');

  const { data, loading, refetch, subscribeToMore } = useQuery<
    IGetCycleQueryResponse,
    IGetCycleQueryVariables
  >(GET_CYCLE_PROGRESS, {
    ...options,
    variables: { ...options.variables, assigneeId: assignee || undefined },
  });

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
  }, [options.variables?._id, subscribeToMore, refetch, assignee]);

  const cycleProgress = data?.getCycleProgress;

  return { cycleProgress, loading, refetch };
};
