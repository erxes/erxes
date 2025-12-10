import { RecordTable, useQueryState } from 'erxes-ui';
import { ACC_TR_RECORDS_CURSOR_SESSION_KEY } from '~/modules/accountsSessionKeys';
import { useTrRecords } from '../hooks/useTrRecords';
import { trRecordColumns, trRecordInvColumns } from './TrRecordsTableColumns';
import { useMemo } from 'react';

const getCols = (journal?: string,) => {
  if (journal?.includes('inv')) {
    const columns = trRecordColumns.concat(trRecordInvColumns);
    return columns.sort((a, b) => (a.colOrder ?? 0) - (b.colOrder ?? 0));
  }

  return trRecordColumns;
}

export const TrRecordTable = () => {
  const { trRecords, loading, handleFetchMore, pageInfo } = useTrRecords();
  const { hasPreviousPage, hasNextPage } = pageInfo || {};

  const [journal] = useQueryState<string>('journal');

  const columns = useMemo(() => {
    return getCols(journal ?? '')
  }, [journal]);


  return (
    <RecordTable.Provider
      columns={columns}
      data={trRecords || []}
      stickyColumns={['more', 'checkbox', 'account']}
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
        {/* <AccountsCommandbar /> */}
      </RecordTable.CursorProvider>
    </RecordTable.Provider>
  );
};
