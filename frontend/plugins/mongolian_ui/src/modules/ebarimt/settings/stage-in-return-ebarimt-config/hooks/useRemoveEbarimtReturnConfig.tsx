import { useMutation } from '@apollo/client';
import { REMOVE_MN_CONFIG, GET_MN_CONFIGS } from '@/ebarimt/settings/stage-in-return-ebarimt-config/graphql/queries/mnConfigs';
import { useToast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

export const useRemoveEbarimtReturnConfig = () => {
  const [removeConfig] = useMutation(REMOVE_MN_CONFIG, {
    refetchQueries: [{ query: GET_MN_CONFIGS, variables: { code: 'returnStageInEbarimt' } }],
  });
  const { toast } = useToast();
  const { t } = useTranslation('mongolian');

  const removeEbarimtReturnConfig = async (configId: string) => {
    try {
      await removeConfig({
        variables: {
          id: configId,
        },
      });

      toast({
        title: t('success'),
        description: t('config-removed-successfully'),
        variant: 'default',
      });

      return 'success';
    } catch (error) {
      toast({
        title: t('error'),
        description: t('failed-to-remove-config'),
        variant: 'destructive',
      });
      throw error;
    }
  };

  return { removeEbarimtReturnConfig };
};
