import { RecordTable, Spinner } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { useTransactionsDetail } from '@/transactions/transaction-form/hooks/useTransactionsDetail';
import { tbalanceColumns } from '@/transactions/transaction-form/components/TBalanceTableColumns';
import { TBalanceTableRow } from '@/transactions/transaction-form/components/TBalanceTableRow';
import { ITBalanceTransaction } from '@/transactions/transaction-form/types/TBalance';

export const AdjustFixedAssetTransactions = ({
  parentId,
  completed,
}: {
  parentId?: string;
  completed: boolean;
}) => {
  const { t } = useTranslation('accounting');
  const {
    transactions = [],
    loading,
    error,
  } = useTransactionsDetail({
    variables: { _id: parentId || '' },
    skip: !parentId,
    fetchPolicy: 'network-only',
  });
  if (loading) return <Spinner />;
  if (error)
    return (
      <p role="alert" className="p-3 text-destructive">
        {error.message}
      </p>
    );
  if (!parentId || !transactions.length)
    return (
      <p className="p-3 text-muted-foreground">
        {completed && !parentId
          ? t('fxa-zero-depreciation-period', {
              defaultValue:
                'Энэ хугацааны элэгдлийн дүн 0 тул журнал үүсээгүй. Элэгдэл эхлэх огноо болон тооцооны дэлгэрэнгүйг шалгана уу.',
            })
          : t('no-transactions')}
      </p>
    );
  const rows: ITBalanceTransaction[] = transactions.flatMap((tr, index) =>
    tr.details.map((detail) => ({
      ...tr,
      date: new Date(tr.date || new Date()),
      number: tr.number || tr.ptrNumber,
      detail,
      branchId: detail.branchId || tr.branchId,
      departmentId: detail.departmentId || tr.departmentId,
      journalIndex: String(index),
    })),
  );
  const byPointer = new Map<string, ITBalanceTransaction[]>();
  for (const row of rows) {
    const pointer = row.ptrId || '';
    const group = byPointer.get(pointer) || [];
    group.push(row);
    byPointer.set(pointer, group);
  }
  return (
    <RecordTable.Provider
      columns={tbalanceColumns(t).filter((column) => column.id !== 'more')}
      data={[...byPointer.values()].flat()}
      stickyColumns={['account']}
      tableId={`accounting_adjust_fxa_transactions_${parentId}`}
    >
      <RecordTable.Scroll>
        <RecordTable>
          <RecordTable.Header />
          <RecordTable.Body>
            <TBalanceTableRow />
          </RecordTable.Body>
        </RecordTable>
      </RecordTable.Scroll>
    </RecordTable.Provider>
  );
};
