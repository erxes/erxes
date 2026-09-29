import { GET_TASK } from '@/task/graphql/queries/getTask';
import { TASK_CHANGED } from '@/task/graphql/subscriptions/taskChanged';
import { QueryHookOptions, useQuery } from '@apollo/client';
import { useEffect } from 'react';
import type { GetTaskQuery, GetTaskQueryVariables } from '~/gql/graphql';

export const useGetTask = (
  options: QueryHookOptions<GetTaskQuery, GetTaskQueryVariables>,
) => {
  const { data, loading, refetch, subscribeToMore, error } = useQuery(
    GET_TASK,
    options,
  );

  const task = data?.getTask ?? undefined;
  const taskId = task?._id;

  useEffect(() => {
    if (!taskId) return;

    const unsubscribe = subscribeToMore({
      document: TASK_CHANGED,
      variables: { _id: taskId },
      updateQuery: (prev, { subscriptionData }) => {
        const newTask = subscriptionData.data?.operationTaskChanged?.task;

        return newTask ? { getTask: newTask } : prev;
      },
    });

    return () => {
      unsubscribe();
    };
  }, [taskId, subscribeToMore]);

  return { task, loading, refetch, error };
};
