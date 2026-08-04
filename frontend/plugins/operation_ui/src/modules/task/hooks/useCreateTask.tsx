import { TASKS_CURSOR_SESSION_KEY } from '@/task/constants';
import { CREATE_TASK_MUTATION } from '@/task/graphql/mutations/createTask';
import { useMutation } from '@apollo/client';
import { useRecordTableCursor, useToast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

export const useCreateTask = () => {
  const { toast } = useToast();
  const { t } = useTranslation('operation');
  const { setCursor } = useRecordTableCursor({
    sessionKey: TASKS_CURSOR_SESSION_KEY,
  });
  const [createTaskMutation, { loading, error }] = useMutation(
    CREATE_TASK_MUTATION,
    {
      // refetchQueries: [GET_TASKS],
      onCompleted: () => {
        toast({
          title: t('success'),
          description: t('task-created-successfully'),
          variant: 'default',
        });
        setCursor(null);
      },
      onError: (e) => {
        toast({
          title: t('error'),
          description: e.message,
          variant: 'destructive',
        });
      },
    },
  );

  return {
    createTask: createTaskMutation,
    loading,
    error,
  };
};
