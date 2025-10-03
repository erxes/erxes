import { OperationVariables, useMutation } from '@apollo/client';
import { ACC_TRANSACTIONS_UPDATE } from '../graphql/mutations/accTransactionsUpdate';
import { toast } from 'erxes-ui';
import { TRANSACTIONS_QUERY, TR_RECORDS_QUERY } from '../../graphql/transactionQueries';
import { TRANSACTION_DETAIL_QUERY } from '../graphql/queries/accTransactionDetail';

export const useTransactionsUpdate = (options?: OperationVariables) => {
  const [_updateTransaction, { loading }] = useMutation(
    ACC_TRANSACTIONS_UPDATE,
    options,
  );

  const updateTransaction = (options: OperationVariables) => {

    return _updateTransaction({
      ...options,
      onError: (error: Error) => {
        toast({
          title: 'Error',
          description: error.message,
          variant: 'destructive',
        });
        options?.onError?.(error);
      },
      onCompleted: (data) => {
        toast({
          title: 'Success',
          description: 'Transactions updated successfully',
        });
        options?.onCompleted?.(data)
      },
      refetchQueries: [
        {
          query: TRANSACTIONS_QUERY,
          variables: {
            "page": 1,
            "perPage": 20
          }
        },
        {
          query: TR_RECORDS_QUERY,
        },
        TRANSACTION_DETAIL_QUERY
      ],
      awaitRefetchQueries: true,
    });

  };

  return {
    updateTransaction,
    loading,
  };
};
