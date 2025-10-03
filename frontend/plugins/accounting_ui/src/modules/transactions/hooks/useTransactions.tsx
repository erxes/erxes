import { TRANSACTIONS_QUERY } from '../graphql/transactionQueries';
import { OperationVariables, useQuery } from '@apollo/client';
import { ACC_TRS__PER_PAGE } from '../types/constants';

export const useTransactions = (options?: OperationVariables) => {
  const { data, loading, error, fetchMore } = useQuery(
    TRANSACTIONS_QUERY,
    {
      ...options,
      variables: {
        ...options?.variables,
        page: 1,
        perPage: ACC_TRS__PER_PAGE,
      },
    }
  );

  const { accTransactions, accTransactionsCount } = data || {};

  const handleFetchMore = () => {
    if (accTransactions?.length < accTransactionsCount) {
      fetchMore({
        variables: {
          perPage: ACC_TRS__PER_PAGE,
          page: Math.ceil(accTransactions?.length / ACC_TRS__PER_PAGE) + 1,
        },
        updateQuery: (prev, { fetchMoreResult }) => {
          return {
            ...prev,
            ...fetchMoreResult,
            accTransactions: [...prev.accTransactions, ...fetchMoreResult.accTransactions],
          };
        },
      });
    }
  };

  return {
    transactions: data?.accTransactions,
    totalCount: data?.accTransactionsCount,
    loading,
    error,
    handleFetchMore,
  };
};
