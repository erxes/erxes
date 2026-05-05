import { useMutation } from '@apollo/client';
import { useToast } from 'erxes-ui';
import { ACC_TRANSACTIONS_REMOVE } from '../graphql/accTransactionsRemove';
import { TRANSACTIONS_QUERY } from '../graphql/transactionQueries';
import { ACC_TRS__PER_PAGE } from '../types/constants';

export const useTransactionsBulkRemove = () => {
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
                variables: {
                  limit: ACC_TRS__PER_PAGE,
                  orderBy: { date: 1 },
                  cursor: '',
                },
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
