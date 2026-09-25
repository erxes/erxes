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

type TAdjustDebtRatesVariables = {
  limit?: number;
  cursor?: string | null;
  orderBy?: Record<string, 1 | -1>;
  searchValue?: string;
};

export const useAdjustDebtRates = (variables?: TAdjustDebtRatesVariables) => {
  const { data, loading, error, refetch } = useQuery<
    IAdjustDebtRatesResponse,
    TAdjustDebtRatesVariables
  >(ADJUST_DEBT_RATE_QUERY, {
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
    adjustDebtRates: data?.adjustDebtRates?.list || [],
    totalCount: data?.adjustDebtRates?.totalCount || 0,
    pageInfo: data?.adjustDebtRates?.pageInfo,
    loading,
    error,
    refetch,
  };
};
