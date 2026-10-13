import { useTranslation } from 'react-i18next';
import { useMutation } from '@apollo/client';
import { toast } from 'erxes-ui';
import { ACCOUNTINGS_MAIN_CONFIGS_UPDATE } from '../graphql/mutations/updateConfig';

export const useMainUpdateConfigs = () => {
  const { t } = useTranslation('accounting');
  const [updateConfig, { loading }] = useMutation(
    ACCOUNTINGS_MAIN_CONFIGS_UPDATE,
  );

  const updateConfigs = (configsMap: Record<string, any>) => {
    return updateConfig({
      variables: { configsMap },
      refetchQueries: ['accountingsConfigs'],
      onError: (error) => {
        toast({
          title: t('error'),
          description: error.message,
          variant: 'destructive',
        });
      },
      onCompleted: () => {
        toast({
          title: t('success'),
          description: t('configuration-saved-successfully'),
        });
      },
    });
  };

  return {
    updateConfigs,
    loading,
  };
};
