import { useMutation } from '@apollo/client';
import { useToast, useRecordTableCursor } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { STAGE_IN_EBARIMT_CONFIG_CURSOR_SESSION_KEY } from '@/ebarimt/settings/stage-in-ebarimt-config/constants';
import { CREATE_MN_CONFIG } from '@/ebarimt/settings/stage-in-ebarimt-config/graphql/queries/mnConfigs';

export const useCreateStageInEbarimtConfig = () => {
  const { toast } = useToast();
  const { t } = useTranslation('mongolian');
  const { setCursor } = useRecordTableCursor({
    sessionKey: STAGE_IN_EBARIMT_CONFIG_CURSOR_SESSION_KEY,
  });

  const [createStageInEbarimtConfigMutation, { loading, error }] = useMutation(
    CREATE_MN_CONFIG,
    {
      onCompleted: () => {
        toast({
          title: t('success'),
          description: t('stage-in-ebarimt-config-created-successfully'),
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
    createStageInEbarimtConfig: createStageInEbarimtConfigMutation,
    loading,
    error,
  };
};
