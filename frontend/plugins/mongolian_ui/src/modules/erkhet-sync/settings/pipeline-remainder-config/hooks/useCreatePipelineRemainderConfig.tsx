import { useMutation } from '@apollo/client';
import { useToast, useRecordTableCursor } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { PIPELINE_REMAINDER_CONFIG_CURSOR_SESSION_KEY } from '../constants';
import { CREATE_MN_CONFIG } from '@/shared/graphql/mnConfigs';

export const useCreatePipelineRemainderConfig = () => {
  const { toast } = useToast();
  const { t } = useTranslation('mongolian');
  const { setCursor } = useRecordTableCursor({
    sessionKey: PIPELINE_REMAINDER_CONFIG_CURSOR_SESSION_KEY,
  });

  const [createPipelineRemainderConfigMutation, { loading, error }] =
    useMutation(CREATE_MN_CONFIG, {
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
