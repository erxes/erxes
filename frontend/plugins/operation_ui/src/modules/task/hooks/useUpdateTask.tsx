import { MutationFunctionOptions, useMutation } from '@apollo/client';
import { UPDATE_TASK_MUTATION } from '@/task/graphql/mutations/updateTask';
import { useToast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

interface IUpdateTaskMutationResponse {
  updateTask: {
    _id: string;
    status: string;
  };
}

interface IUpdateTaskVariables extends Record<string, unknown> {
  _id: string;
  status?: string;
}

export const useUpdateTask = () => {
  const { t } = useTranslation('operation');
  const { toast } = useToast();
  const [_updateTask, { loading, error }] = useMutation<
    IUpdateTaskMutationResponse,
    IUpdateTaskVariables
  >(UPDATE_TASK_MUTATION);
  const updateTask = (
    options: MutationFunctionOptions<
      IUpdateTaskMutationResponse,
      IUpdateTaskVariables
    >,
  ) => {
    const variables = options.variables;
    const optimisticResponse =
      options.optimisticResponse ||
      (variables?.status
        ? {
            updateTask: {
              __typename: 'Task' as const,
              _id: variables._id,
              status: variables.status,
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
