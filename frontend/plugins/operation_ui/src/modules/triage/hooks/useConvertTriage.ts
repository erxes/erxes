import { useMutation } from '@apollo/client';
import { useToast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { CONVERT_TRIAGE_TO_TASK } from '../graphql/mutations/convertTriage';

import { GET_TRIAGES } from '@/triage/graphql/queries/getTriages';

import { useTaskDetailSheet } from '@/task/hooks/useTaskDetailSheet';
import { GET_TRIAGE } from '@/triage/graphql/queries/getTriage';

export const useConvertTriage = () => {
  const { t } = useTranslation('operation');
  const { toast } = useToast();

  const [, setActiveTask] = useTaskDetailSheet();

  const [convertTriageToTaskMutation, { loading, error }] = useMutation(
    CONVERT_TRIAGE_TO_TASK,
  );
  const convertTriageToTask = (
    options: Parameters<typeof convertTriageToTaskMutation>[0],
  ) => {
    return convertTriageToTaskMutation({
      ...options,
      refetchQueries: [GET_TRIAGES, GET_TRIAGE],
      // The task takes the triage's id: drop the cached "no task" for it so
      // rows listing that id show the task.
      update: (cache, { data }) => {
        const taskId = data?.operationConvertTriageToTask?._id;

        if (taskId) {
          cache.evict({
            id: 'ROOT_QUERY',
            fieldName: 'getTask',
            args: { _id: taskId },
          });
        }
      },
      onError: (error) => {
        toast({
          title: t('error'),
          description: error.message,
          variant: 'destructive',
        });
      },

      onCompleted: (data) => {
        toast({
          title: t('success'),
          description: t('triage-converted-successfully'),
        });

        const taskId = data.operationConvertTriageToTask?._id;

        if (taskId) {
          setActiveTask(taskId);
        }
      },
    });
  };
  return { convertTriageToTask, loading, error };
};
