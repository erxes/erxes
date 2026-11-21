import { useMutation } from '@apollo/client';
import { toast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import type { AccountingTransactionDecision } from '~/gql/graphql';
import { TRANSACTION_CONTENT_TYPE } from '../../constants/transactionPanel';
import {
  ACC_TRANSACTION_DECLINE_NOTE_ADD,
  ACC_TRANSACTIONS_DECIDE,
} from '../graphql/mutations/accTransactionsDecide';
import { TRANSACTIONS_DETAIL_QUERY } from '../graphql/queries/accTransactionsDetail';

/** Internal notes store BlockNote blocks; a plain reason is one paragraph. */
const toNoteContent = (text: string) =>
  JSON.stringify([
    {
      type: 'paragraph',
      props: {
        textColor: 'default',
        backgroundColor: 'default',
        textAlignment: 'left',
      },
      content: [{ type: 'text', text, styles: {} }],
      children: [],
    },
  ]);

export const useTransactionsDecide = () => {
  const { t } = useTranslation('accounting');
  const [decideMutation, { loading: deciding }] = useMutation(
    ACC_TRANSACTIONS_DECIDE,
  );
  const [addNote, { loading: noting }] = useMutation(
    ACC_TRANSACTION_DECLINE_NOTE_ADD,
  );

  const decide = async (
    parentId: string,
    decision: AccountingTransactionDecision,
    note?: string,
  ) => {
    try {
      await decideMutation({
        variables: { parentId, decision },
        refetchQueries: [
          { query: TRANSACTIONS_DETAIL_QUERY, variables: { _id: parentId } },
        ],
        awaitRefetchQueries: true,
      });
      const reason = note?.trim();
      if (reason) {
        await addNote({
          variables: {
            contentType: TRANSACTION_CONTENT_TYPE,
            contentTypeId: parentId,
            content: toNoteContent(reason),
          },
        });
      }
      toast({
        title: t('success'),
        description: t(
          decision === 'APPROVE'
            ? 'transaction-approved'
            : 'transaction-declined',
        ),
        variant: 'success',
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

  return { decide, loading: deciding || noting };
};
