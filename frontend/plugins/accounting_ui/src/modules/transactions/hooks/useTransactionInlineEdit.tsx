import { useApolloClient } from '@apollo/client';
import { toast } from 'erxes-ui';
import { useAtomValue } from 'jotai';
import { useTranslation } from 'react-i18next';
import { currentUserState } from 'ui-modules';
import { cleanTrDocs } from '@/transactions/transaction-form/components/utils';
import { JOURNALS_BY_JOURNAL } from '@/transactions/transaction-form/contants/defaultValues';
import { transactionGroupSchema } from '@/transactions/transaction-form/contants/transactionSchema';
import { TRANSACTIONS_DETAIL_QUERY } from '@/transactions/transaction-form/graphql/queries/accTransactionsDetail';
import { useTransactionsUpdate } from '@/transactions/transaction-form/hooks/useTransactionsUpdate';
import { getNextMentionFields } from '@/transactions/transaction-form/utils/statusWorkflow';
import { TR_STATUSES } from '@/transactions/types/constants';
import { ITransaction } from '@/transactions/types/Transaction';
import { readTransactionViews } from '@/transactions/utils/transactionView';
import { toGraphqlView } from '@/utils/graphql';

export interface ITransactionInlineEdit {
  number?: string;
  description?: string;
}

export const useTransactionInlineEdit = () => {
  const { t } = useTranslation('accounting');
  const client = useApolloClient();
  const currentUser = useAtomValue(currentUserState);
  const { updateTransaction, loading } = useTransactionsUpdate();

  const showError = (description: string) =>
    toast({ title: t('error'), description, variant: 'destructive' });

  const editTransaction = async (
    transaction: ITransaction,
    { number, description }: ITransactionInlineEdit,
  ) => {
    const { parentId } = transaction;
    const targetId = transaction.originId || transaction._id;

    if (!parentId || !targetId) {
      return;
    }

    try {
      const { data } = await client.query({
        query: TRANSACTIONS_DETAIL_QUERY,
        variables: { _id: parentId },
        fetchPolicy: 'network-only',
      });
      const { transactions, error } = readTransactionViews(
        toGraphqlView(data)?.accTransactionsDetail,
      );

      if (error) {
        showError(error.message);
        return;
      }

      const activeTrs = transactions?.filter((tr) => !tr.originId) || [];
      const currentTr =
        activeTrs.find((tr) => tr._id === targetId) || activeTrs[0];

      if (!currentTr) {
        showError(t('transaction-not-found'));
        return;
      }

      const status = currentTr.status || TR_STATUSES.COMPLETE;
      const parsed = await transactionGroupSchema.safeParseAsync({
        parentId,
        number: number ?? (currentTr.number || 'auto'),
        ptrNumber: currentTr.ptrNumber,
        contentType: currentTr.contentType,
        contentId: currentTr.contentId,
        date: new Date(currentTr.date || new Date()),
        status,
        ...getNextMentionFields({
          currentUserId: currentUser?._id,
          nextStatus: status,
          mentionOwnerId: currentTr.mentionOwnerId || currentUser?._id,
          mentionUserIds: currentTr.mentionUserIds ?? [],
        }),
        trDocs: activeTrs.map((tr) =>
          JOURNALS_BY_JOURNAL(
            tr.journal || '',
            tr._id === targetId && description !== undefined
              ? { ...tr, description }
              : tr,
          ),
        ),
      });

      if (!parsed.success) {
        showError(parsed.error.issues[0]?.message || t('error'));
        return;
      }

      await updateTransaction({
        variables: { parentId, trDocs: cleanTrDocs(parsed.data) },
      });
    } catch (e) {
      showError(e instanceof Error ? e.message : String(e));
    }
  };

  return { editTransaction, loading };
};
