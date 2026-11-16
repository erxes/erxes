import { useMutation } from '@apollo/client';
import { useToast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { ACC_TRANSACTIONS_REMOVE } from '../graphql/accTransactionsRemove';
import { TRANSACTIONS_QUERY } from '../graphql/transactionQueries';
import { ITransaction } from '../types/Transaction';
import { useTransactionsVariables } from './useTransactionVars';

export const useTransactionsBulkRemove = () => {
  const { t } = useTranslation('accounting');
  const variables = useTransactionsVariables();
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
            refetchQueries: [
              {
                query: TRANSACTIONS_QUERY,
                variables,
              },
            ],
            update: (cache) => {
              cache.evict({ fieldName: 'accTrRecordsMain' });
              cache.gc();
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
