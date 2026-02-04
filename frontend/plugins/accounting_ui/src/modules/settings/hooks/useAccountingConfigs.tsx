import { QueryHookOptions, useQuery } from '@apollo/client';
import { GET_ACCOUNTING_CONFIGS } from '../graphql/queries/mainConfigs';
import { IConfig } from '../types/Config';

export const useAccountingConfigs = (options?: QueryHookOptions) => {
  const { data, loading, error } = useQuery<{
    accountingsConfigs: IConfig[];
  }>(
    GET_ACCOUNTING_CONFIGS,
    {
      variables: {
        ...options?.variables,
        code: options?.variables?.code ?? '',
      },
      skip: !options?.variables?.code
    }
  );

  const { accountingsConfigs } = data || {};

  return {
    configs: accountingsConfigs,
    loading,
    error,
  };
};
