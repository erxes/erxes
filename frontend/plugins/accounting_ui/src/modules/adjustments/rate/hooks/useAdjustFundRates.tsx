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

export const useAdjustFundRates = (variables?: any) => {
  const { data, loading, error, refetch } = useQuery<IAdjustFundRatesResponse>(
    ADJUST_FUND_RATE_QUERY,
    {
      variables: {
        limit: 20,
        cursor: null,
        orderBy: { createdAt: -1 },
        ...variables,
      },
      fetchPolicy: 'cache-and-network',
      notifyOnNetworkStatusChange: true,
    },
  );

  return {
    adjustFundRates: data?.adjustFundRates?.list || [],
    totalCount: data?.adjustFundRates?.totalCount || 0,
    pageInfo: data?.adjustFundRates?.pageInfo,
    loading,
    error,
    refetch,
  };
};
