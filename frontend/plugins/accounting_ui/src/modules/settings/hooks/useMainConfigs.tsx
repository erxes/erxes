import { useQuery } from '@apollo/client';
import { CONFIGS_BY_CODE } from '../graphql/queries/mainConfigs';
import { TMainConfig } from '../types/Config';

export const useMainConfigs = () => {
  const { data, loading, error } = useQuery<{
    accountingsConfigsByCode: TMainConfig;
  }>(
    CONFIGS_BY_CODE,
    {
      variables: {
        codes: [
          'MainCurrency',
          'HasVat',
          'VatPayableAccount',
          'VatReceivableAccount',
          'VatAfterPayableAccount',
          'VatAfterReceivableAccount',
          'HasCtax',
          'CtaxPayableAccount',
        ]
      },
    }
  );

  const { accountingsConfigsByCode } = data || {};

  return {
    configs: accountingsConfigsByCode,
    loading,
    error,
  };
};
