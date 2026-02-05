import { useMutation } from '@apollo/client';
import { ACCOUNTINGS_MAIN_CONFIGS_UPDATE } from '../graphql/mutations/updateConfig';

export const useMainUpdateConfigs = () => {
  const [updateConfig, { loading }] = useMutation(ACCOUNTINGS_MAIN_CONFIGS_UPDATE);

  const updateConfigs = (configsMap: Record<string, any>) => {
    return updateConfig({
      variables: { configsMap },
      refetchQueries: ['accountingsConfigs'],
    });
  };

  return {
    updateConfigs,
    loading,
  };
};
