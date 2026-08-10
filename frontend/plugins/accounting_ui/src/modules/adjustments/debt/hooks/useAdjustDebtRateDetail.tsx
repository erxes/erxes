import { OperationVariables, QueryHookOptions, useQuery } from '@apollo/client';
import { useEffect } from 'react';
import { ADJUST_DEBT_RATE_DETAIL_QUERY } from '../graphql/adjustDebtRateQueries';
import { ACCOUNTING_ADJUST_DEBT_RATE_CHANGED } from '../graphql/adjustDebtRateSubscription';
import { IAdjustDebtRate } from '../types/AdjustDebtRate';

interface IAdjustDebtRateDetailResponse {
  adjustDebtRateDetail: IAdjustDebtRate;
}

export const useAdjustDebtRateDetail = (
  options?: QueryHookOptions<IAdjustDebtRateDetailResponse, OperationVariables>,
) => {
  const adjustId = options?.variables?._id;
  const { data, loading, error, refetch, subscribeToMore } =
    useQuery<IAdjustDebtRateDetailResponse, OperationVariables>(
      ADJUST_DEBT_RATE_DETAIL_QUERY,
      {
      ...options,
      fetchPolicy: 'cache-and-network',
      },
    );

  useEffect(() => {
    if (!adjustId) {
      return;
    }

    const unsubscribe = subscribeToMore<{
      accountingAdjustDebtRateChanged?: IAdjustDebtRate;
    }>({
      document: ACCOUNTING_ADJUST_DEBT_RATE_CHANGED,
      variables: { adjustId },
      updateQuery: (prev, { subscriptionData }) => ({
        adjustDebtRateDetail:
          subscriptionData.data?.accountingAdjustDebtRateChanged ||
          prev.adjustDebtRateDetail,
      }),
    });

    return () => {
      unsubscribe();
    };
  }, [adjustId, subscribeToMore]);

  return {
    adjustDebtRate: data?.adjustDebtRateDetail,
    loading,
    error,
    refetch,
  };
};
