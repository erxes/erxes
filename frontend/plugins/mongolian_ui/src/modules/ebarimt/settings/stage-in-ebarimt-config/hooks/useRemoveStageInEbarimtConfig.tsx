import { useMutation } from '@apollo/client';
import { REMOVE_MN_CONFIG, GET_MN_CONFIGS } from '@/ebarimt/settings/stage-in-ebarimt-config/graphql/queries/mnConfigs';
import { useToast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

export const useRemoveStageInEbarimtConfig = () => {
  const [removeConfig] = useMutation(REMOVE_MN_CONFIG, {
    refetchQueries: [{ query: GET_MN_CONFIGS, variables: { code: 'stageInEbarimt' } }],
  });
  const { toast } = useToast();
  const { t } = useTranslation('mongolian');

  const removeStageInEbarimtConfig = async (configId: string) => {
    try {
      await removeConfig({
        variables: {
          id: configId,
        },
      });

      toast({
        title: t('success'),
        description: t('config-deleted-successfully'),
        variant: 'default',
      });
    } catch (error) {
      console.error('Error removing config:', error);
      toast({
        title: t('error'),
        description: t('failed-to-delete-config'),
        variant: 'destructive',
      });
      throw error;
    }
  };

  return {
    removeStageInEbarimtConfig,
  };
};
