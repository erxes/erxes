import { useMutation } from '@apollo/client';
import { useToast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { UPDATE_MN_CONFIG } from '@/shared/graphql/mnConfigs';

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
