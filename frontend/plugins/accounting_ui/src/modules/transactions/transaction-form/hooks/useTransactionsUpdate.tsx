import { OperationVariables, useMutation } from '@apollo/client';
import { ACC_TRANSACTIONS_UPDATE } from '../graphql/mutations/accTransactionsUpdate';
import { toast } from 'erxes-ui';
import { TRANSACTIONS_QUERY } from '../../graphql/transactionQueries';
import { ACC_TRS__PER_PAGE } from '../../types/constants';

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
        options?.onCompleted?.(data);
      },
      refetchQueries: [
        {
          query: TRANSACTIONS_QUERY,
          variables: {
            limit: ACC_TRS__PER_PAGE,
            orderBy: {
              date: 1,
            },
            cursor: '',
          },
        },
      ],
      awaitRefetchQueries: true,
    });
  };

  return {
    updateTransaction,
    loading,
  };
};
