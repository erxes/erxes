import { useQuery } from '@apollo/client';
import { ADJUST_DEBT_RATE_QUERY } from '../graphql/adjustDebtRateQueries';
import { IAdjustDebtRate } from '../types/AdjustDebtRate';

interface IAdjustDebtRatesResponse {
  adjustDebtRates: {
    list: IAdjustDebtRate[];
    totalCount: number;
    pageInfo: {
      hasNextPage: boolean;
      hasPreviousPage: boolean;
      startCursor: string | null;
      endCursor: string | null;
    };
  };
}

export const useAdjustDebtRates = (variables?: any) => {
  const { data, loading, error, refetch } = useQuery<IAdjustDebtRatesResponse>(
    ADJUST_DEBT_RATE_QUERY,
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
    adjustDebtRates: data?.adjustDebtRates?.list || [],
    totalCount: data?.adjustDebtRates?.totalCount || 0,
    pageInfo: data?.adjustDebtRates?.pageInfo,
    loading,
    error,
    refetch,
  };
};
