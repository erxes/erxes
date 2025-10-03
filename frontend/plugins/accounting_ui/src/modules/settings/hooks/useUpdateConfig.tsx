import { useMutation } from '@apollo/client';
import { ACCOUNTINGS_CONFIGS_UPDATE } from '../graphql/mutations/updateConfig';

export const useUpdateConfig = () => {
  const [updateConfig, { loading }] = useMutation(ACCOUNTINGS_CONFIGS_UPDATE);

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
