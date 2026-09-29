import { QueryHookOptions, useQuery, useSubscription } from '@apollo/client';
import { IProjectProgressByMember } from '@/project/types';
import { TASK_LIST_CHANGED } from '@/task/graphql/subscriptions/taskListChanged';
import { GET_CYCLE_PROGRESS_BY_MEMBER } from '@/cycle/graphql/queries/getCycleProgressByMember';
import { useQueryState } from 'erxes-ui';

interface IGetCycleQueryResponse {
  getCycleProgressByMember: IProjectProgressByMember[];
}

export const useGetCycleProgressByMember = (options: QueryHookOptions) => {
  const [assignee] = useQueryState<string>('assignee');

  const { data, loading, refetch } = useQuery<IGetCycleQueryResponse>(
    GET_CYCLE_PROGRESS_BY_MEMBER,
    {
      ...options,
      variables: { ...options.variables, assigneeId: assignee || undefined },
    },
  );

  const cycleProgressByMember = data?.getCycleProgressByMember;

  useSubscription(TASK_LIST_CHANGED, {
    variables: {
      filter: { cycleId: options.variables?._id },
    },
    ignoreResults: true,
    onData: () => {
      refetch();
    },
  });

  return { cycleProgressByMember, loading, refetch };
};
