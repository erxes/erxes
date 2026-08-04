import { useMutation } from '@apollo/client';
import { useToast, useRecordTableCursor } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { EBARIMT_RETURN_CONFIG_CURSOR_SESSION_KEY } from '@/ebarimt/settings/stage-in-return-ebarimt-config/constants';
import { CREATE_MN_CONFIG } from '../graphql/queries/mnConfigs';

export const useCreateEbarimtReturnConfig = () => {
  const { toast } = useToast();
  const { t } = useTranslation('mongolian');
  const { setCursor } = useRecordTableCursor({
    sessionKey: EBARIMT_RETURN_CONFIG_CURSOR_SESSION_KEY,
  });

  const [createEbarimtReturnConfigMutation, { loading, error }] = useMutation(
    CREATE_MN_CONFIG,
    {
      onCompleted: () => {
        toast({
          title: t('success'),
          description: t('ebarimt-return-config-created-successfully'),
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
    createEbarimtReturnConfig: createEbarimtReturnConfigMutation,
    loading,
    error,
  };
};
