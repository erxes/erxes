import { useMutation, MutationHookOptions } from '@apollo/client';
import { UPDATE_TASK_MUTATION } from '@/task/graphql/mutations/updateTask';
import { useToast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
export const useUpdateTask = () => {
  const { t } = useTranslation('operation');
  const { toast } = useToast();
  const [_updateTask, { loading, error }] = useMutation(UPDATE_TASK_MUTATION);
  const updateTask = (options: MutationHookOptions) => {
    return _updateTask({
      ...options,
      onError: (error) => {
        toast({
          title: t('error'),
          description: error.message,
          variant: 'destructive',
        });
      },
    });
  };

  return { updateTask, loading, error };
};
