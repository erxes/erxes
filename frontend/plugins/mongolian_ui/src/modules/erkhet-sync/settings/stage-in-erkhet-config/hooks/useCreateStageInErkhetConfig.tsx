import { useMutation } from '@apollo/client';
import { useToast, useRecordTableCursor } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { STAGE_IN_ERKHET_CONFIG_CURSOR_SESSION_KEY } from '../constants';
import { CREATE_MN_CONFIG } from '@/shared/graphql/mnConfigs';

export const useCreateStageInErkhetConfig = () => {
  const { t } = useTranslation('mongolian');
  const { toast } = useToast();
  const { setCursor } = useRecordTableCursor({
    sessionKey: STAGE_IN_ERKHET_CONFIG_CURSOR_SESSION_KEY,
  });

  const [createStageInErkhetConfigMutation, { loading, error }] = useMutation(
    CREATE_MN_CONFIG,
    {
      onCompleted: () => {
        toast({
          title: t('success'),
          description: t('stage-in-erkhet-config-created-successfully'),
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
    },
  );

  return {
    createStageInErkhetConfig: createStageInErkhetConfigMutation,
    loading,
    error,
  };
};
