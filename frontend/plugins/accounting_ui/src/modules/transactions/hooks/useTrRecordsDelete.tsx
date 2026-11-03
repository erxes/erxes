import { useApolloClient } from '@apollo/client';
import dayjs from 'dayjs';
import { useConfirm, useToast } from 'erxes-ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { TRANSACTIONS_DETAIL_QUERY } from '@/transactions/transaction-form/graphql/queries/accTransactionsDetail';
import { ITrRecord } from '@/transactions/types/Transaction';
import {
  buildTrRecordsDeleteScope,
  getTrRecordsParents,
  TrRecordsByParentId,
} from '@/transactions/utils/trRecordsDeleteScope';
import { useTrRecordsRemove } from '@/transactions/hooks/useTrRecordsRemove';

const formatDate = (date: unknown) =>
  typeof date === 'string' || date instanceof Date
    ? dayjs(date).format('YYYY-MM-DD')
    : '';

export const useTrRecordsDelete = () => {
  const { t } = useTranslation('accounting');
  const client = useApolloClient();
  const { confirm } = useConfirm();
  const { toast } = useToast();
  const { removeTrRecords, loading: removing } = useTrRecordsRemove();
  const [preparing, setPreparing] = useState(false);

  const deleteTrRecords = async (records: ITrRecord[]) => {
    const parents = getTrRecordsParents(records);

    if (!parents.length) {
      return false;
    }

    setPreparing(true);

    let trsByParentId: TrRecordsByParentId;

    try {
      const results = await Promise.all(
        parents.map(({ parentId }) =>
          client.query({
            query: TRANSACTIONS_DETAIL_QUERY,
            variables: { _id: parentId },
            fetchPolicy: 'network-only',
          }),
        ),
      );

      trsByParentId = Object.fromEntries(
        parents.map(({ parentId }, index) => [
          parentId,
          (results[index].data?.accTransactionsDetail ?? []).filter(
            (tr) => tr !== null,
          ),
        ]),
      );
    } catch (error) {
      toast({
        title: t('error'),
        description: error instanceof Error ? error.message : undefined,
        variant: 'destructive',
      });

      return false;
    } finally {
      setPreparing(false);
    }

    const scope = buildTrRecordsDeleteScope(records, trsByParentId);

    try {
      await confirm({
        message: t('delete-tr-records-transactions', {
          count: scope.transactions.length,
        }),
        options: {
          description: t('delete-tr-records-lines', { count: scope.lineCount }),
          content: (
            <div className="flex flex-col gap-2 text-sm">
              <ul className="max-h-40 overflow-y-auto rounded-md border divide-y">
                {scope.transactions.map((tr) => (
                  <li
                    key={tr.parentId}
                    className="flex items-center justify-between gap-3 px-3 py-1.5"
                  >
                    <span className="font-medium">{tr.number || '-'}</span>
                    <span className="text-muted-foreground tabular-nums">
                      {formatDate(tr.date)} ·{' '}
                      {t('tr-records-line-count', { count: tr.lineCount })}
                    </span>
                  </li>
                ))}
              </ul>
              {scope.hasPublished && (
                <p className="text-destructive">
                  {t('delete-tr-records-published')}
                </p>
              )}
            </div>
          ),
          okLabel: t('delete'),
          cancelLabel: t('cancel'),
          variants: { ok: 'destructive' },
        },
      });
    } catch {
      return false;
    }

    let allRemoved = true;

    for (const { parentId } of parents) {
      const { errors } = await removeTrRecords(parentId);

      allRemoved = allRemoved && !errors;
    }

    return allRemoved;
  };

  return { deleteTrRecords, loading: preparing || removing };
};
