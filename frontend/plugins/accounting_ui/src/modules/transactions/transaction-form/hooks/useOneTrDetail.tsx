import { useQuery, OperationVariables } from '@apollo/client';
import { TRANSACTION_DETAIL_QUERY } from '../graphql/queries/accTransactionDetail';
import { ITransaction } from '../../types/Transaction';

export const useOneTrDetail = (options?: OperationVariables) => {
  const { data, loading, error } = useQuery<
    { accTransactionDetail: ITransaction[] },
    OperationVariables
  >(TRANSACTION_DETAIL_QUERY, {
    ...options,
  });

  const transactions = data?.accTransactionDetail;


  return {
    transaction: transactions?.find(tr => tr._id),
    loading,
    error,
  };
};
