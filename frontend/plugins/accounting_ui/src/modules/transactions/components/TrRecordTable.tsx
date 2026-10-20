import { useTranslation } from 'react-i18next';
import { IconFileOff } from '@tabler/icons-react';
import { RecordTable, useQueryState } from 'erxes-ui';
import { AccountingEmptyState } from '@/layout/components/AccountingEmptyState';
import { ACC_TR_RECORDS_CURSOR_SESSION_KEY } from '~/modules/accountsSessionKeys';
import { useTrRecords } from '../hooks/useTrRecords';
import { trRecordColumns } from './TrRecordsTableColumns';
import { useMemo } from 'react';
import { TransactionsCommandbar } from './TransactionsCommandBar';

const hasInventoryLikeDetails = (journal?: string) =>
  journal?.includes('inv') || journal?.includes('fxa');

export const TrRecordTable = () => {
  const { t } = useTranslation('accounting');
  const { trRecords, loading, error, handleFetchMore, pageInfo } =
    useTrRecords();
  const { hasPreviousPage, hasNextPage } = pageInfo || {};

  const [journal] = useQueryState<string>('journal');
  const showsInventoryDetails = hasInventoryLikeDetails(journal ?? '');
  const columns = useMemo(
    () =>
      showsInventoryDetails
        ? trRecordColumns(t)
        : trRecordColumns(t).filter((column) => !column.id?.includes('inv')),
    [showsInventoryDetails, t],
  );

  if (!loading && !trRecords?.length) {
    return (
      <AccountingEmptyState
        error={error}
        icon={IconFileOff}
        title={t('no-transaction-found')}
      />
    );
  }

  return (
    <RecordTable.Provider
      key={showsInventoryDetails ? 'inventory-records' : 'standard-records'}
      columns={columns}
      data={trRecords || []}
      stickyColumns={['more', 'checkbox', 'account']}
      tableId="accounting_transaction_records_record_table"
      className="m-3"
    >
      <RecordTable.CursorProvider
        hasPreviousPage={hasPreviousPage}
        hasNextPage={hasNextPage}
        dataLength={trRecords?.length}
        sessionKey={ACC_TR_RECORDS_CURSOR_SESSION_KEY}
      >
        <RecordTable>
          <RecordTable.Header />
          <RecordTable.Body>
            <RecordTable.CursorBackwardSkeleton
              handleFetchMore={handleFetchMore}
            />
            {loading && <RecordTable.RowSkeleton rows={40} />}
            <RecordTable.RowList />
            <RecordTable.CursorForwardSkeleton
              handleFetchMore={handleFetchMore}
            />
          </RecordTable.Body>
        </RecordTable>
        <TransactionsCommandbar />
      </RecordTable.CursorProvider>
    </RecordTable.Provider>
  );
};
