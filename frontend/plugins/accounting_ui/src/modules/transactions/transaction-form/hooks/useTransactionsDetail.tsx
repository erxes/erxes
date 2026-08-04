import { useQuery, OperationVariables } from '@apollo/client';
import { useEffect, useMemo } from 'react';
import { TRANSACTIONS_DETAIL_QUERY } from '../graphql/queries/accTransactionsDetail';
import { ITransaction } from '../../types/Transaction';
import { ACCOUNTING_TRANSACTION_CHANGED } from '../../graphql/transactionSubscriptions';

export const useTransactionsDetail = (options?: OperationVariables) => {
  const parentId = options?.variables?._id;
  const { data, loading, error, refetch, subscribeToMore } = useQuery<
    { accTransactionsDetail: ITransaction[] },
    OperationVariables
  >(TRANSACTIONS_DETAIL_QUERY, {
    ...options,
  });

  useEffect(() => {
    if (!parentId) {
      return;
    }

    const unsubscribe = subscribeToMore<{
      accountingTransactionChanged?: { action?: string };
    }>({
      document: ACCOUNTING_TRANSACTION_CHANGED,
      variables: {
        parentId,
      },
      updateQuery: (prev, { subscriptionData }) => {
        const changed = subscriptionData.data?.accountingTransactionChanged;

        if (changed?.action === 'removed') {
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

  const transactions = data?.accTransactionsDetail;
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
    error,
  };
};
