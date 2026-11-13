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
    customerId
    companyId
  }
`);

// Task lists never filter or sort by these fields, so saving them alone (the
// description autosave, custom properties) must not refetch every task list.
const LIST_NEUTRAL_FIELDS = new Set(['_id', 'description', 'propertiesData']);

const affectsTaskLists = (variables?: UpdateTaskMutationVariables) =>
  !variables ||
  Object.entries(variables).some(
    ([key, value]) => value !== undefined && !LIST_NEUTRAL_FIELDS.has(key),
  );

export const useUpdateTask = () => {
  const { t } = useTranslation('operation');
  const { toast } = useToast();
  const client = useApolloClient();
  const [_updateTask, { loading, error }] = useMutation(UPDATE_TASK_MUTATION);
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
              customerId: cached?.customerId ?? null,
              companyId: cached?.companyId ?? null,
            },
          }
        : undefined);

    return _updateTask({
      refetchQueries: affectsTaskLists(variables) ? ['GetTasks'] : [],
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
