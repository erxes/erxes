import { useQuery, OperationVariables } from '@apollo/client';
import { ITransaction } from '../../types/Transaction';
import { TRANSACTION_DETAIL_QUERY } from '../graphql/queries/accTransactionDetail';

export const useTransactionDetail = (options?: OperationVariables) => {
  const { data, loading, error, refetch } = useQuery<OperationVariables>(
    TRANSACTION_DETAIL_QUERY,
    {
      ...options,
    },
  );
  const transaction: ITransaction = data?.accTransactionDetail[0];
  return {
    transaction,
    loading,
    error,
    refetch,
  };
};
