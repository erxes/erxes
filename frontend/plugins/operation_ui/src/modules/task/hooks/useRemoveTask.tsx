import { useMutation, MutationFunctionOptions } from '@apollo/client';
import { REMOVE_TASK_MUTATION } from '@/task/graphql/mutations/removeTask';
import { useToast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

export const useRemoveTask = () => {
  const { toast } = useToast();
  const { t } = useTranslation('operation');
  const [_removeTask, { loading, error }] = useMutation(REMOVE_TASK_MUTATION, {
    refetchQueries: ['GetTasks'],
  });
  const removeTask = (id: string, options?: MutationFunctionOptions) => {
    return _removeTask({
      ...options,
      variables: {
        id,
        ...options?.variables,
      },
      onError: (error) => {
        toast({
          title: t('error'),
          description: error.message,
          variant: 'destructive',
        });
      },
    });
  };

  return { removeTask, loading, error };
};
