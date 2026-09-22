import { OperationVariables, QueryHookOptions, useQuery } from '@apollo/client';
import { useEffect } from 'react';
import { ADJUST_FUND_RATE_DETAIL_QUERY } from '../graphql/adjustFundRateQueries';
import { ACCOUNTING_ADJUST_FUND_RATE_CHANGED } from '../graphql/adjustFundRateSubscription';
import { IAdjustFundRate } from '../types/AdjustFundRate';

export const useAdjustFundRateDetail = (
  options?: QueryHookOptions<
    { adjustFundRateDetail: IAdjustFundRate },
    OperationVariables
  >,
) => {
  const { data, loading, error, subscribeToMore } = useQuery<
    { adjustFundRateDetail: IAdjustFundRate },
    OperationVariables
  >(ADJUST_FUND_RATE_DETAIL_QUERY, {
    ...options,
    fetchPolicy: 'network-only',
  });

  useEffect(() => {
    const adjustId = options?.variables?._id;

    if (!adjustId) {
      return;
    }

    const unsubscribe = subscribeToMore<{
      accountingAdjustFundRateChanged: IAdjustFundRate;
    }>({
      document: ACCOUNTING_ADJUST_FUND_RATE_CHANGED,
      variables: { adjustId },
      updateQuery: (prev, { subscriptionData }) => {
        if (!prev || !subscriptionData.data) {
          return prev;
        }

        return {
          adjustFundRateDetail:
            subscriptionData.data.accountingAdjustFundRateChanged,
        };
      },
    });

    return () => {
      unsubscribe();
    };
  }, [options?.variables?._id, subscribeToMore]);

  return {
    adjustFundRate: data?.adjustFundRateDetail,
    loading,
    error,
  };
};
