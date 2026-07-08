import { useMutation } from '@apollo/client';
import { REMOVE_MN_CONFIG, GET_MN_CONFIGS } from '@/ebarimt/settings/pos-in-ebarimt-config/graphql/mnConfigs';
import { useToast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

export const useRemovePosInEbarimtConfig = () => {
  const { t } = useTranslation('mongolian');
  const [removeConfig] = useMutation(REMOVE_MN_CONFIG, {
    refetchQueries: [{ query: GET_MN_CONFIGS, variables: { code: 'posInEbarimt' } }],
  });
  const { toast } = useToast();

  const removePosInEbarimtConfig = async (configId: string) => {
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
    removePosInEbarimtConfig,
  };
};
