import { useMutation } from '@apollo/client';
import { useToast } from 'erxes-ui';
import { ACC_TRANSACTIONS_REMOVE } from '../graphql/accTransactionsRemove';
import { TRANSACTIONS_QUERY } from '../graphql/transactionQueries';
import { useTransactionsVariables } from './useTransactionVars';

export const useTransactionsBulkRemove = () => {
  const variables = useTransactionsVariables();
  const [_removeTransactions, { loading }] = useMutation(
    ACC_TRANSACTIONS_REMOVE,
  );
  const { toast } = useToast();

  const removeTransactions = async (transactions: any[]) => {
    try {
      const uniqueParentIds = [...new Set(transactions.map((t) => t.parentId))];
      const results = await Promise.allSettled(
        uniqueParentIds.map((parentId) =>
          _removeTransactions({
            variables: { parentId },
            refetchQueries: [
              {
                query: TRANSACTIONS_QUERY,
                variables,
              },
            ],
          }),
        ),
      );

      const failures = results.filter((result) => result.status === 'rejected');
      if (failures.length > 0) {
        throw new Error(`Failed to delete ${failures.length} transactions`);
      }

      toast({
        title: 'Success',
        variant: 'success',
        description: 'Transactions deleted successfully',
      });
    } catch (e: any) {
      toast({
        title: 'Error',
        description: e.message,
        variant: 'destructive',
      });
      throw e;
    }
  };

  return { removeTransactions, loading };
};
