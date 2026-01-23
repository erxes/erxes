import { useQuery, OperationVariables } from '@apollo/client';
import { TRANSACTIONS_DETAIL_QUERY } from '../graphql/queries/accTransactionsDetail';
import { ITransaction } from '../../types/Transaction';

export const useTransactionsDetail = (options?: OperationVariables) => {
  const { data, loading, error } = useQuery<
    { accTransactionsDetail: ITransaction[] },
    OperationVariables
  >(TRANSACTIONS_DETAIL_QUERY, {
    ...options,
  });
  const transactions = data?.accTransactionsDetail;

  return {
    transactions,
    activeTrs: transactions?.filter((tr) => !tr.originId),
    followTrs: transactions?.filter((tr) => tr.originId) || [],
    loading,
    error,
  };
};
