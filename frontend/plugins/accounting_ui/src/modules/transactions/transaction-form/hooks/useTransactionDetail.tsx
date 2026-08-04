import { useQuery, OperationVariables } from '@apollo/client';
import { TRANSACTION_DETAIL_QUERY } from '../graphql/queries/accTransactionDetail';
import { ITransaction } from '../../types/Transaction';

export const useTransactionDetail = (options?: OperationVariables) => {
  const { data, loading, error, refetch } = useQuery<OperationVariables>(
    TRANSACTION_DETAIL_QUERY,
    {
      ...options,
    },
  );
  const transaction: ITransaction = data?.accTransactionDetail;

  return {
    transaction,
    loading,
    error,
    refetch,
  };
};
