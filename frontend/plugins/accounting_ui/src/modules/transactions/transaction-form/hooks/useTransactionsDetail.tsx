import { readTransactionViews } from '@/transactions/utils/transactionView';
import type {
  AccountingAccTransactionsDetailQuery,
  AccountingAccTransactionsDetailQueryVariables,
} from '~/gql/graphql';
import type { QueryHookOptions } from '@apollo/client';
import { toGraphqlView } from '@/utils/graphql';
import { useQuery } from '@apollo/client';
import { useEffect, useMemo } from 'react';
import { TRANSACTIONS_DETAIL_QUERY } from '../graphql/queries/accTransactionsDetail';

import { ACCOUNTING_TRANSACTION_CHANGED } from '../../graphql/transactionSubscriptions';

export const useTransactionsDetail = (
  options?: QueryHookOptions<
    AccountingAccTransactionsDetailQuery,
    AccountingAccTransactionsDetailQueryVariables
  >,
) => {
  const parentId = options?.variables?._id;
  const {
    data: queryData,
    loading,
    error,
    refetch,
    subscribeToMore,
  } = useQuery(TRANSACTIONS_DETAIL_QUERY, {
    ...options,
  });
  const data = toGraphqlView(queryData);

  useEffect(() => {
    if (!parentId) {
      return;
    }

    const unsubscribe = subscribeToMore({
      document: ACCOUNTING_TRANSACTION_CHANGED,
      variables: {
        parentId,
      },
      updateQuery: (prev, { subscriptionData }) => {
        const changed = subscriptionData.data?.accountingTransactionChanged;

        if (
          changed &&
          typeof changed === 'object' &&
          'action' in changed &&
          changed.action === 'removed'
        ) {
          return {
            accTransactionsDetail: [],
          };
        }

        if (changed) {
          refetch();
        }

        return prev;
      },
    });

    return () => {
      unsubscribe();
    };
  }, [parentId, refetch, subscribeToMore]);

  const { transactions, error: metadataError } = useMemo(
    () => readTransactionViews(data?.accTransactionsDetail),
    [data?.accTransactionsDetail],
  );
  const activeTrs = useMemo(
    () => transactions?.filter((tr) => !tr.originId),
    [transactions],
  );
  const followTrs = useMemo(
    () => transactions?.filter((tr) => tr.originId) || [],
    [transactions],
  );

  return {
    transactions,
    activeTrs,
    followTrs,
    loading,
    error: metadataError ?? error,
  };
};
