import { GET_TASK } from '@/task/graphql/queries/getTask';
import { TASK_CHANGED } from '@/task/graphql/subscriptions/taskChanged';
import { QueryHookOptions, useQuery, useSubscription } from '@apollo/client';
import type { GetTaskQuery, GetTaskQueryVariables } from '~/gql/graphql';

export const useGetTask = (
  taskId: string | null | undefined,
  options?: QueryHookOptions<GetTaskQuery, GetTaskQueryVariables>,
) => {
  const { data, loading, refetch, error } = useQuery(GET_TASK, {
    ...options,
    variables: taskId ? { _id: taskId } : undefined,
    skip: !taskId || options?.skip,
  });

  useSubscription(TASK_CHANGED, {
    variables: taskId ? { _id: taskId } : undefined,
    skip: !taskId || options?.skip,
    ignoreResults: true,
  });

  return { task: data?.getTask, loading, refetch, error };
};
