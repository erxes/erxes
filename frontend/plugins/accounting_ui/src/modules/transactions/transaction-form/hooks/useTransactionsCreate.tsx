import { OperationVariables, useMutation } from '@apollo/client';
import { ACC_TRANSACTIONS_CREATE } from '../graphql/mutations/accTransactionsCreate';
import { toast } from 'erxes-ui';
import { useNavigate } from 'react-router-dom';
import { TR_RECORDS_QUERY, TRANSACTIONS_QUERY } from '../../graphql/transactionQueries';


export const useTransactionsCreate = (options?: OperationVariables) => {
  const navigate = useNavigate();

  const [_createTransaction, { loading }] = useMutation(
    ACC_TRANSACTIONS_CREATE,
    options,
  );

  const createTransaction = (options?: OperationVariables) => {
    return _createTransaction({
      ...options,
      onError: (error: Error) => {
        toast({
          title: 'Error',
          description: error.message,
          variant: 'destructive',
        });
        options?.onError?.(error);
      },
      onCompleted: () => {
        toast({
          title: 'Success',
          description: 'Transactions created successfully',
        });
        options?.onCompleted()
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
      update: (_cache, { data }) => {
        const newParentId = data?.accTransactionsCreate[0]?.parentId;

        const pathname = newParentId
          ? `/accounting/transaction/edit?parentId=${newParentId}`
          : "/accounting/main";

        navigate(pathname);
      },
    });
  };

  return {
    createTransaction,
    loading,
  };
};
