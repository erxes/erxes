import { QueryHookOptions, useQuery } from '@apollo/client';
import { IProjectProgressByMember } from '@/project/types';
import { useEffect } from 'react';
import { TASK_LIST_CHANGED } from '@/task/graphql/subscriptions/taskListChanged';
import { GET_CYCLE_PROGRESS_BY_MEMBER } from '@/cycle/graphql/queries/getCycleProgressByMember';
import { useQueryState } from 'erxes-ui';

interface IGetCycleQueryResponse {
  getCycleProgressByMember: IProjectProgressByMember[];
}

export const useGetCycleProgressByMember = (options: QueryHookOptions) => {
  const [assignee] = useQueryState<string>('assignee');

  const { data, loading, refetch, subscribeToMore } =
    useQuery<IGetCycleQueryResponse>(GET_CYCLE_PROGRESS_BY_MEMBER, {
      ...options,
      variables: { ...options.variables, assigneeId: assignee || undefined },
    });

  const cycleProgressByMember = data?.getCycleProgressByMember;

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

  return { cycleProgressByMember, loading, refetch };
};
