import { useQuery } from '@apollo/client';
import { ADJUST_DEBT_RATE_DETAIL_QUERY } from '../graphql/adjustDebtRateQueries';
import { IAdjustDebtRate } from '../types/AdjustDebtRate';

interface IAdjustDebtRateDetailResponse {
  adjustDebtRateDetail: IAdjustDebtRate;
}

export const useAdjustDebtRateDetail = (options?: any) => {
  const { data, loading, error, refetch } =
    useQuery<IAdjustDebtRateDetailResponse>(ADJUST_DEBT_RATE_DETAIL_QUERY, {
      ...options,
      fetchPolicy: 'cache-and-network',
    });

  return {
    adjustDebtRate: data?.adjustDebtRateDetail,
    loading,
    error,
    refetch,
  };
};
