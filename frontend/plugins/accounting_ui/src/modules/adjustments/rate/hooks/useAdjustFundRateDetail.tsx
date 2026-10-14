import type {
  AccountingAdjustFundRateDetailQuery,
  AccountingAdjustFundRateDetailQueryVariables,
} from '~/gql/graphql';
import { toGraphqlView } from '@/utils/graphql';
import { QueryHookOptions, useQuery } from '@apollo/client';
import { useEffect } from 'react';
import { ADJUST_FUND_RATE_DETAIL_QUERY } from '../graphql/adjustFundRateQueries';
import { ACCOUNTING_ADJUST_FUND_RATE_CHANGED } from '../graphql/adjustFundRateSubscription';

export const useAdjustFundRateDetail = (
  options?: QueryHookOptions<
    AccountingAdjustFundRateDetailQuery,
    AccountingAdjustFundRateDetailQueryVariables
  >,
) => {
  const {
    data: queryData,
    loading,
    error,
    subscribeToMore,
  } = useQuery(ADJUST_FUND_RATE_DETAIL_QUERY, {
    ...options,
    fetchPolicy: 'network-only',
  });
  const data = toGraphqlView(queryData);

  useEffect(() => {
    const adjustId = options?.variables?._id;

    if (!adjustId) {
      return;
    }

    const unsubscribe = subscribeToMore({
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
