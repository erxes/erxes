import { ACC_TRANSACTIONS_REMOVE } from '../graphql/mutations/accTransactionsRemove';
import { OperationVariables, useMutation } from '@apollo/client';
import { toast } from 'erxes-ui';
import { TR_RECORDS_QUERY, TRANSACTIONS_QUERY } from '../../graphql/transactionQueries';
import { useNavigate } from 'react-router-dom';

export const useTransactionsRemove = (options?: OperationVariables) => {
  const navigate = useNavigate();
  const [_removeTransactions, { loading }] = useMutation(
    ACC_TRANSACTIONS_REMOVE,
    options
  );

  const removeTransactions = (options: OperationVariables) => {
    return _removeTransactions({
      ...options,
      onError: (error: Error) => {
        toast({
          title: 'Error',
          description: error.message,
          variant: 'destructive',
        });
      },
      onCompleted: () => {
        toast({
          title: 'Success',
          description: 'Transactions deleted successfully',
        });
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
        }
      ],
      awaitRefetchQueries: true,
      update: (cache) => {
        const pathname = "/accounting/main";
        navigate(pathname);
      },
    });
  };

  return {
    removeTransactions,
    loading,
  };
};
