import { useMutation } from '@apollo/client';
import { useToast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { ACC_TRANSACTIONS_REMOVE } from '../graphql/accTransactionsRemove';
import { ITransaction } from '../types/Transaction';
import { removeTransactionParentFromCache } from '@/transactions/utils/transactionListChange';

export const useTransactionsBulkRemove = () => {
  const { t } = useTranslation('accounting');
  const [_removeTransactions, { loading }] = useMutation(
    ACC_TRANSACTIONS_REMOVE,
  );
  const { toast } = useToast();

  const removeTransactions = async (
    transactions: Pick<ITransaction, 'parentId'>[],
  ) => {
    try {
      const uniqueParentIds = [...new Set(transactions.map((t) => t.parentId))];
      const results = await Promise.allSettled(
        uniqueParentIds.map((parentId) =>
          _removeTransactions({
            variables: { parentId },
            optimisticResponse: { accTransactionsRemove: { parentId } },
            update: (cache) => {
              removeTransactionParentFromCache(cache, parentId);
            },
          }),
        ),
      );

      const failures = results.filter((result) => result.status === 'rejected');
      if (failures.length > 0) {
        throw new Error(`Failed to delete ${failures.length} transactions`);
      }

      toast({
        title: t('success'),
        variant: 'success',
        description: t('transactions-deleted-successfully'),
      });
      return true;
    } catch (error) {
      toast({
        title: t('error'),
        description: error instanceof Error ? error.message : String(error),
        variant: 'destructive',
      });
      return false;
    }
  };

  return { removeTransactions, loading };
};
