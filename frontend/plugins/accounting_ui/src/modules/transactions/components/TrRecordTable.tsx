import { RecordTable, useQueryState } from 'erxes-ui';
import { ACC_TR_RECORDS_CURSOR_SESSION_KEY } from '~/modules/accountsSessionKeys';
import { useTrRecords } from '../hooks/useTrRecords';
import { trRecordColumns } from './TrRecordsTableColumns';
import { useMemo } from 'react';
import { TransactionsCommandbar } from './TransactionsCommandBar';

const hasInventoryLikeDetails = (journal?: string) =>
  journal?.includes('inv') || journal?.includes('fxa');

export const TrRecordTable = () => {
  const { trRecords, loading, handleFetchMore, pageInfo } = useTrRecords();
  const { hasPreviousPage, hasNextPage } = pageInfo || {};

  const [journal] = useQueryState<string>('journal');
  const showsInventoryDetails = hasInventoryLikeDetails(journal ?? '');
  const columns = useMemo(
    () =>
      showsInventoryDetails
        ? trRecordColumns
        : trRecordColumns.filter((column) => !column.id?.includes('inv')),
    [showsInventoryDetails],
  );

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
