import { useMutation } from '@apollo/client';
import { useToast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { UPDATE_MN_CONFIG } from '@/ebarimt/settings/stage-in-ebarimt-config/graphql/queries/mnConfigs';

export const useUpdateStageInEbarimtConfig = () => {
  const { toast } = useToast();
  const { t } = useTranslation('mongolian');

  const [updateStageInEbarimtConfigMutation, { loading, error }] = useMutation(
    UPDATE_MN_CONFIG,
    {
      onCompleted: () => {
        toast({
          title: t('success'),
          description: t('stage-in-ebarimt-config-updated-successfully'),
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
    updateStageInEbarimtConfig: updateStageInEbarimtConfigMutation,
    loading,
    error,
  };
};
