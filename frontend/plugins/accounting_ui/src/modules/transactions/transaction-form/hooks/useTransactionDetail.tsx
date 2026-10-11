import { readTransactionViews } from '@/transactions/utils/transactionView';
import type {
  AccountingAccTransactionDetailQuery,
  AccountingAccTransactionDetailQueryVariables,
} from '~/gql/graphql';
import type { QueryHookOptions } from '@apollo/client';
import { toGraphqlView } from '@/utils/graphql';
import { useQuery } from '@apollo/client';
import { useMemo } from 'react';
import { TRANSACTION_DETAIL_QUERY } from '../graphql/queries/accTransactionDetail';

export const useTransactionDetail = (
  options?: QueryHookOptions<
    AccountingAccTransactionDetailQuery,
    AccountingAccTransactionDetailQueryVariables
  >,
) => {
  const {
    data: queryData,
    loading,
    error,
    refetch,
  } = useQuery(TRANSACTION_DETAIL_QUERY, {
    ...options,
  });
  const data = toGraphqlView(queryData);
  const result = useMemo(
    () =>
      readTransactionViews(
        data?.accTransactionDetail ? [data.accTransactionDetail] : undefined,
      ),
    [data?.accTransactionDetail],
  );

  return {
    transaction: result.transactions?.[0],
    loading,
    error: result.error ?? error,
    refetch,
  };
};
