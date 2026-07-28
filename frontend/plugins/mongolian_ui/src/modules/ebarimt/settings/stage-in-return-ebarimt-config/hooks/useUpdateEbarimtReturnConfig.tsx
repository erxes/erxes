import { useMutation } from '@apollo/client';
import { useToast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { UPDATE_MN_CONFIG } from '@/ebarimt/settings/stage-in-return-ebarimt-config/graphql/queries/mnConfigs';

export const useUpdateEbarimtReturnConfig = () => {
  const { toast } = useToast();
  const { t } = useTranslation('mongolian');

  const [updateEbarimtReturnConfigMutation, { loading, error }] = useMutation(
    UPDATE_MN_CONFIG,
    {
      onCompleted: () => {
        toast({
          title: t('success'),
          description: t('ebarimt-return-config-updated-successfully'),
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
    updateEbarimtReturnConfig: updateEbarimtReturnConfigMutation,
    loading,
    error,
  };
};
