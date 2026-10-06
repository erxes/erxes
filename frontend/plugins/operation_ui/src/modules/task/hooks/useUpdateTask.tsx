import {
  MutationFunctionOptions,
  useApolloClient,
  useMutation,
} from '@apollo/client';
import { UPDATE_TASK_MUTATION } from '@/task/graphql/mutations/updateTask';
import { useToast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { gql } from '~/gql';
import type {
  UpdateTaskMutation,
  UpdateTaskMutationVariables,
} from '~/gql/graphql';

const TASK_OPTIMISTIC_FIELDS = gql(`
  fragment TaskOptimisticFields on Task {
    tagIds
    propertiesData
  }
`);

export const useUpdateTask = () => {
  const { t } = useTranslation('operation');
  const { toast } = useToast();
  const client = useApolloClient();
  const [_updateTask, { loading, error }] = useMutation(UPDATE_TASK_MUTATION, {
    refetchQueries: ['GetTasks'],
  });
  const updateTask = (
    options: MutationFunctionOptions<
      UpdateTaskMutation,
      UpdateTaskMutationVariables
    >,
  ) => {
    const variables = options.variables;
    const cached = variables?._id
      ? client.readFragment({
          id: client.cache.identify({ __typename: 'Task', _id: variables._id }),
          fragment: TASK_OPTIMISTIC_FIELDS,
        })
      : null;
    const optimisticResponse =
      options.optimisticResponse ||
      (variables?.status
        ? {
            updateTask: {
              __typename: 'Task' as const,
              _id: variables._id,
              status: variables.status,
              tagIds: cached?.tagIds ?? null,
              propertiesData: cached?.propertiesData ?? null,
            },
          }
        : undefined);

    return _updateTask({
      ...options,
      ...(optimisticResponse ? { optimisticResponse } : {}),
      onError: (error) => {
        toast({
          title: t('error'),
          description: error.message,
          variant: 'destructive',
        });
        options.onError?.(error);
      },
    });
  };

  return { updateTask, loading, error };
};
