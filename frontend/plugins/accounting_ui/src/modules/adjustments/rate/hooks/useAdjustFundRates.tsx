import { useQuery } from '@apollo/client';
import { ADJUST_FUND_RATE_QUERY } from '../graphql/adjustFundRateQueries';
import { IAdjustFundRate } from '../types/AdjustFundRate';

interface IAdjustFundRatesResponse {
  adjustFundRates: {
    list: IAdjustFundRate[];
    totalCount: number;
    pageInfo: {
      hasNextPage: boolean;
      hasPreviousPage: boolean;
      startCursor: string | null;
      endCursor: string | null;
    };
  };
}

type TAdjustFundRatesVariables = {
  limit?: number;
  cursor?: string | null;
  orderBy?: Record<string, 1 | -1>;
  searchValue?: string;
};

export const useAdjustFundRates = (variables?: TAdjustFundRatesVariables) => {
  const { data, loading, error, refetch } = useQuery<
    IAdjustFundRatesResponse,
    TAdjustFundRatesVariables
  >(ADJUST_FUND_RATE_QUERY, {
    variables: {
      limit: 20,
      cursor: null,
      orderBy: { createdAt: -1 },
      ...variables,
    },
    fetchPolicy: 'cache-and-network',
    notifyOnNetworkStatusChange: true,
  });

  return {
    adjustFundRates: data?.adjustFundRates?.list || [],
    totalCount: data?.adjustFundRates?.totalCount || 0,
    pageInfo: data?.adjustFundRates?.pageInfo,
    loading,
    error,
    refetch,
  };
};
