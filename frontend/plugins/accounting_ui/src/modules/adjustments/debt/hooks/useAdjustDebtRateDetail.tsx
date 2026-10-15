import type {
  AccountingAdjustDebtRateDetailQuery,
  AccountingAdjustDebtRateDetailQueryVariables,
} from '~/gql/graphql';
import { toGraphqlView } from '@/utils/graphql';
import { QueryHookOptions, useQuery } from '@apollo/client';
import { useEffect } from 'react';
import { ADJUST_DEBT_RATE_DETAIL_QUERY } from '../graphql/adjustDebtRateQueries';
import { ACCOUNTING_ADJUST_DEBT_RATE_CHANGED } from '../graphql/adjustDebtRateSubscription';

export const useAdjustDebtRateDetail = (
  options?: QueryHookOptions<
    AccountingAdjustDebtRateDetailQuery,
    AccountingAdjustDebtRateDetailQueryVariables
  >,
) => {
  const adjustId = options?.variables?._id;
  const {
    data: queryData,
    loading,
    error,
    refetch,
    subscribeToMore,
  } = useQuery(ADJUST_DEBT_RATE_DETAIL_QUERY, {
    ...options,
    fetchPolicy: 'cache-and-network',
  });
  const data = toGraphqlView(queryData);

  useEffect(() => {
    if (!adjustId) {
      return;
    }

    const unsubscribe = subscribeToMore({
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
