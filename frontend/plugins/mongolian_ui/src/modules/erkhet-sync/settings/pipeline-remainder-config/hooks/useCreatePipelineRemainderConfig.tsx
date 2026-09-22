import { useMutation } from '@apollo/client';
import { useToast, useRecordTableCursor } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { CREATE_PIPELINE_REMAINDER_CONFIG } from '../graphql/mutations/createPipelineRemainderConfigMutations';
import { PIPELINE_REMAINDER_CONFIG_CURSOR_SESSION_KEY } from '../constants';

export const useCreatePipelineRemainderConfig = () => {
  const { toast } = useToast();
  const { t } = useTranslation('mongolian');
  const { setCursor } = useRecordTableCursor({
    sessionKey: PIPELINE_REMAINDER_CONFIG_CURSOR_SESSION_KEY,
  });

  const [createPipelineRemainderConfigMutation, { loading, error }] =
    useMutation(CREATE_PIPELINE_REMAINDER_CONFIG, {
      onCompleted: () => {
        toast({
          title: t('success'),
          description: t('pipeline-remainder-config-created-successfully'),
          variant: 'default',
        });
        setCursor('');
      },
      onError: (e) => {
        toast({
          title: t('error'),
          description: e.message,
          variant: 'destructive',
        });
      },
    });

  return {
    createPipelineRemainderConfig: createPipelineRemainderConfigMutation,
    loading,
    error,
  };
};
