import { QueryHookOptions, useQuery } from '@apollo/client';
import { GET_CYCLE_PROGRESS_BY_PROJECT } from '@/cycle/graphql/queries/getCycleProgressByProject';
import { ICycleProgressByProject } from '@/cycle/types';
import { useEffect } from 'react';
import { TASK_LIST_CHANGED } from '@/task/graphql/subscriptions/taskListChanged';
import { useQueryState } from 'erxes-ui';
interface IGetCycleQueryResponse {
  getCycleProgressByProject: ICycleProgressByProject[];
}

export const useGetCycleProgressByProject = (options: QueryHookOptions) => {
  const [assignee] = useQueryState<string>('assignee');

  const { data, loading, refetch, subscribeToMore } =
    useQuery<IGetCycleQueryResponse>(GET_CYCLE_PROGRESS_BY_PROJECT, {
      ...options,
      variables: { ...options.variables, assigneeId: assignee || undefined },
    });

  const cycleProgressByProject = data?.getCycleProgressByProject;

  useEffect(() => {
    const unsubscribe = subscribeToMore({
      document: TASK_LIST_CHANGED,
      variables: { filter: { cycleId: options.variables?._id } },
      updateQuery: () => {
        refetch();
      },
    });

    return () => {
      unsubscribe();
    };
  }, [options.variables?._id, subscribeToMore, refetch, assignee]);

  return { cycleProgressByProject, loading, refetch };
};
