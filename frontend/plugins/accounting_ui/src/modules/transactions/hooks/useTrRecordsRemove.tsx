import { OperationVariables, useMutation } from '@apollo/client';
import { useToast } from 'erxes-ui';
import { ACC_TRANSACTIONS_REMOVE } from '../graphql/accTransactionsRemove';
import { TR_RECORDS_QUERY } from '../graphql/transactionQueries';
import { useTransactionsVariables } from './useTransactionVars';

export const useTrRecordsRemove = (options?: OperationVariables) => {
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
            ...variables,
          },
        },
      ],
      awaitRefetchQueries: true,
    });
  };

  return {
    removeTrRecords,
    loading,
  };
};
