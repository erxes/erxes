import { toGraphqlView } from '@/utils/graphql';
import { useQuery } from '@apollo/client';
import { ADJUST_FUND_RATE_QUERY } from '../graphql/adjustFundRateQueries';

type TAdjustFundRatesVariables = {
  limit?: number;
  cursor?: string | null;
  orderBy?: Record<string, 1 | -1>;
  searchValue?: string;
};

export const useAdjustFundRates = (variables?: TAdjustFundRatesVariables) => {
  const {
    data: queryData,
    loading,
    error,
    refetch,
  } = useQuery(ADJUST_FUND_RATE_QUERY, {
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
    adjustFundRates: data?.adjustFundRates?.list || [],
    totalCount: data?.adjustFundRates?.totalCount || 0,
    pageInfo: data?.adjustFundRates?.pageInfo,
    loading,
    error,
    refetch,
  };
};
