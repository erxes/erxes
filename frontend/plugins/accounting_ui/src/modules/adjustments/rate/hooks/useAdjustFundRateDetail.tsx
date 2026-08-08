import { useQuery } from '@apollo/client';
import { ADJUST_FUND_RATE_DETAIL_QUERY } from '../graphql/adjustFundRateQueries';
import { IAdjustFundRate } from '../types/AdjustFundRate';

export const useAdjustFundRateDetail = (options?: any) => {
  const { data, loading } = useQuery<{
    adjustFundRateDetail: IAdjustFundRate;
  }>(ADJUST_FUND_RATE_DETAIL_QUERY, {
    ...options,
    fetchPolicy: 'network-only',
  });

  return {
    adjustFundRate: data?.adjustFundRateDetail,
    loading,
  };
};
