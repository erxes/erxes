import { OperationVariables, useMutation } from '@apollo/client';
import { useToast } from 'erxes-ui';
import { useNavigate } from 'react-router-dom';
import { ACC_TRANSACTIONS_REMOVE } from '../graphql/accTransactionsRemove';
import { TR_RECORDS_QUERY } from '../graphql/transactionQueries';
import { useTransactionsVariables } from './useTransactionVars';
import { ACC_TRS__PER_PAGE } from '../types/constants';

export const useTrRecordsRemove = (options?: OperationVariables) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const variables = useTransactionsVariables();
  const [_removeTrRecords, { loading }] = useMutation(
    ACC_TRANSACTIONS_REMOVE,
    options,
  );

  const removeTrRecords = (parentId?: string) => {
    return _removeTrRecords({
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
          description: 'Transaction record deleted successfully',
        });
      },
      refetchQueries: [
        {
          query: TR_RECORDS_QUERY,
          variables: {
            limit: ACC_TRS__PER_PAGE,
            orderBy: {
              date: 1,
            },
            cursor: '',
            ...variables,
          },
        },
      ],
      awaitRefetchQueries: true,
      // update: (cache) => {
      //   const pathname = '/accounting/main';
      //   navigate(pathname);
      // },
    });
  };

  return {
    removeTrRecords,
    loading,
  };
};
