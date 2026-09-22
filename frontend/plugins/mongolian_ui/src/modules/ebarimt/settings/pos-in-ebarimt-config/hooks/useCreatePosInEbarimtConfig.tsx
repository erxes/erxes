import { useMutation } from '@apollo/client';
import { useToast, useRecordTableCursor } from 'erxes-ui';
import { POS_IN_EBARIMT_CONFIG_CURSOR_SESSION_KEY } from '@/ebarimt/settings/pos-in-ebarimt-config/constants';
import { CREATE_MN_CONFIG } from '@/ebarimt/settings/pos-in-ebarimt-config/graphql/mnConfigs';
import { useTranslation } from 'react-i18next';

export const useCreatePosInEbarimtConfig = () => {
  const { t } = useTranslation('mongolian');
  const { toast } = useToast();
  const { setCursor } = useRecordTableCursor({
    sessionKey: POS_IN_EBARIMT_CONFIG_CURSOR_SESSION_KEY,
  });

  const [createPosInEbarimtConfigMutation, { loading, error }] = useMutation(
    CREATE_MN_CONFIG,
    {
      onCompleted: () => {
        toast({
          title: t('success'),
          description: t('pos-in-ebarimt-config-created-successfully'),
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
    createPosInEbarimtConfig: createPosInEbarimtConfigMutation,
    loading,
    error,
  };
};
