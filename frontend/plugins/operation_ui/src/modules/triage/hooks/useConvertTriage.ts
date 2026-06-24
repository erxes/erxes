import { useMutation, MutationHookOptions } from '@apollo/client';
import { useToast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { CONVERT_TRIAGE_TO_TASK } from '../graphql/mutations/convertTriage';

import { GET_TRIAGES } from '@/triage/graphql/queries/getTriages';

import { useSetAtom } from 'jotai';
import { taskDetailSheetState } from '@/task/states/taskDetailSheetState';
import { GET_TRIAGE } from '@/triage/graphql/queries/getTriage';

export const useConvertTriage = () => {
  const { t } = useTranslation('operation');
  const { toast } = useToast();

  const setActiveTask = useSetAtom(taskDetailSheetState);

  const [convertTriageToTaskMutation, { loading, error }] = useMutation(
    CONVERT_TRIAGE_TO_TASK,
  );
  const convertTriageToTask = (options: MutationHookOptions) => {
    return convertTriageToTaskMutation({
      ...options,
      refetchQueries: [GET_TRIAGES, GET_TRIAGE],
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

        setActiveTask(data.operationConvertTriageToTask._id);
      },
    });
  };
  return { convertTriageToTask, loading, error };
};
