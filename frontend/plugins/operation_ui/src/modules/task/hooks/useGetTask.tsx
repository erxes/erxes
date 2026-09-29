import { GET_TASK } from '@/task/graphql/queries/getTask';
import { TASK_CHANGED } from '@/task/graphql/subscriptions/taskChanged';
import { QueryHookOptions, useQuery } from '@apollo/client';
import { useEffect } from 'react';
import type { GetTaskQuery, GetTaskQueryVariables } from '~/gql/graphql';

export const useGetTask = (
  taskId: string | null | undefined,
  options?: QueryHookOptions<GetTaskQuery, GetTaskQueryVariables>,
) => {
  const { data, loading, refetch, subscribeToMore, error } = useQuery(
    GET_TASK,
    {
      ...options,
      variables: taskId ? { _id: taskId } : undefined,
      skip: !taskId || options?.skip,
    },
  );

  const task = data?.getTask;

  useEffect(() => {
    if (!task?._id) return;

    const unsubscribe = subscribeToMore({
      document: TASK_CHANGED,
      variables: { _id: task._id },
      updateQuery: (prev, { subscriptionData }) => {
        const newTask = subscriptionData.data?.operationTaskChanged?.task;

        return newTask ? { getTask: newTask } : prev;
      },
    });

    return () => {
      unsubscribe();
    };
  }, [task?._id, subscribeToMore]);

  return { task, loading, refetch, error };
};
