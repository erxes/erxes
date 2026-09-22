import { useMutation } from '@apollo/client';
import { useToast } from 'erxes-ui';
import { UPDATE_MN_CONFIG } from '@/ebarimt/settings/pos-in-ebarimt-config/graphql/mnConfigs';
import { useTranslation } from 'react-i18next';

export const useUpdatePosInEbarimtConfig = () => {
  const { t } = useTranslation('mongolian');
  const { toast } = useToast();

  const [updatePosInEbarimtConfigMutation, { loading, error }] = useMutation(
    UPDATE_MN_CONFIG,
    {
      onCompleted: () => {
        toast({
          title: t('success'),
          description: t('pos-in-ebarimt-config-updated-successfully'),
          variant: 'default',
        });
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
    updatePosInEbarimtConfig: updatePosInEbarimtConfigMutation,
    loading,
    error,
  };
};
