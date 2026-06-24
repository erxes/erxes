import { useMutation } from '@apollo/client';
import { useToast, useRecordTableCursor } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { CREATE_STAGE_IN_RETURN_ERKHET_CONFIG } from '@/erkhet-sync/settings/stage-in-return-erkhet-config/graphql/mutations/createStageInReturnErkhetConfigMutations';
import { STAGE_IN_RETURN_ERKHET_CONFIG_CURSOR_SESSION_KEY } from '@/erkhet-sync/settings/stage-in-return-erkhet-config/constants';

export const useCreateStageInReturnErkhetConfig = () => {
  const { t } = useTranslation('mongolian');
  const { toast } = useToast();
  const { setCursor } = useRecordTableCursor({
    sessionKey: STAGE_IN_RETURN_ERKHET_CONFIG_CURSOR_SESSION_KEY,
  });

  const [createStageInReturnErkhetConfigMutation, { loading, error }] =
    useMutation(CREATE_STAGE_IN_RETURN_ERKHET_CONFIG, {
      onCompleted: () => {
        toast({
          title: t('success'),
          description: t('stage-in-return-erkhet-config-created-successfully'),
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
    createStageInReturnErkhetConfig: createStageInReturnErkhetConfigMutation,
    loading,
    error,
  };
};
