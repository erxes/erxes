import { useUpdateTask } from '@/task/hooks/useUpdateTask';
import { useToast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

export const useTaskCustomFieldEdit = () => {
  const { updateTask, loading } = useUpdateTask();
  const { toast } = useToast();
  const { t } = useTranslation('operation');

  return {
    mutate: (variables: { _id: string } & Record<string, unknown>) =>
      updateTask({
        variables,
        onCompleted: () => {
          toast({
            title: t('task-properties-updated', {
              defaultValue: 'Task properties updated',
            }),
            variant: 'success',
          });
        },
      }),
    loading,
  };
};
