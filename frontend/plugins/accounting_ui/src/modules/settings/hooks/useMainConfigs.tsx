import { useQuery } from '@apollo/client';
import { MAIN_CONFIGS } from '../graphql/queries/mainConfigs';
import { IConfig, TMainConfig } from '../types/Config';

export const useMainConfigs = () => {
  const { data, loading, error } = useQuery<{
    accountingsConfigs: IConfig[];
  }>(MAIN_CONFIGS);

  const { accountingsConfigs } = data || {};

  const configs = accountingsConfigs?.reduce<TMainConfig>((acc, config) => {
    return { ...acc, [config.code]: config.value };
  }, {} as TMainConfig);

  return {
    configs,
    loading,
    error,
  };
};
