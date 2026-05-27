import { OperationVariables, useMutation } from '@apollo/client';
import { useToast } from 'erxes-ui';
import { useNavigate } from 'react-router-dom';
import { ACC_TRANSACTIONS_REMOVE } from '../../graphql/accTransactionsRemove';
import { TRANSACTIONS_QUERY } from '../../graphql/transactionQueries';
import { useTransactionsVariables } from '../../hooks/useTransactionVars';

export const useTransactionsRemove = (options?: OperationVariables) => {
  const navigate = useNavigate();
  const variables = useTransactionsVariables();

  const [_removeTransactions, { loading }] = useMutation(
    ACC_TRANSACTIONS_REMOVE,
    options,
  );
  const { toast } = useToast();

  const removeTransactions = (parentId?: string) => {
    return _removeTransactions({
      variables: { parentId },
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
          variables,
        },
      ],
      awaitRefetchQueries: true,
      update: (cache) => {
        const pathname = '/accounting/main';
        navigate(pathname);
      },
    });
  };

  return {
    removeTransactions,
    loading,
  };
};
