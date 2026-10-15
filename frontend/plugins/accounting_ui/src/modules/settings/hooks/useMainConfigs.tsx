import { toGraphqlView } from '@/utils/graphql';
import { useQuery } from '@apollo/client';
import { useMemo } from 'react';
import { CONFIGS_BY_CODE } from '../graphql/queries/mainConfigs';

import { mainSettingsSchema } from '../constants/mainSettingsSchema';

export const useMainConfigs = () => {
  const {
    data: queryData,
    loading,
    error,
  } = useQuery(CONFIGS_BY_CODE, {
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
        'dominantReadAccountUsers',
        'dominantWriteAccountUsers',
      ],
    },
  });
  const data = toGraphqlView(queryData);

  const { accountingsConfigsByCode } = data || {};
  const parsed = useMemo(
    () => mainSettingsSchema.partial().safeParse(accountingsConfigsByCode),
    [accountingsConfigsByCode],
  );

  return {
    configs: parsed.success ? parsed.data : undefined,
    loading,
    error,
  };
};
