import { toGraphqlView } from '@/utils/graphql';
import { useQuery } from '@apollo/client';
import { ADJUST_DEBT_RATE_QUERY } from '../graphql/adjustDebtRateQueries';

type TAdjustDebtRatesVariables = {
  limit?: number;
  cursor?: string | null;
  orderBy?: Record<string, 1 | -1>;
  searchValue?: string;
};

export const useAdjustDebtRates = (variables?: TAdjustDebtRatesVariables) => {
  const {
    data: queryData,
    loading,
    error,
    refetch,
  } = useQuery(ADJUST_DEBT_RATE_QUERY, {
    variables: {
      limit: 20,
      cursor: null,
      orderBy: { createdAt: -1 },
      ...variables,
    },
    fetchPolicy: 'cache-and-network',
    notifyOnNetworkStatusChange: true,
  });
  const data = toGraphqlView(queryData);

  return {
    adjustDebtRates: data?.adjustDebtRates?.list || [],
    totalCount: data?.adjustDebtRates?.totalCount || 0,
    pageInfo: data?.adjustDebtRates?.pageInfo,
    loading,
    error,
    refetch,
  };
};
