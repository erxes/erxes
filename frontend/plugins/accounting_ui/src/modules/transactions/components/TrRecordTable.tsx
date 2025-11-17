import { RecordTable } from 'erxes-ui';
import { ACC_TR_RECORDS_CURSOR_SESSION_KEY } from '~/modules/accountsSessionKeys';
import { useTrRecords } from '../hooks/useTrRecords';
import { trRecordColumns } from './TrRecordsTableColumns';

export const TrRecordTable = () => {
  const { trRecords, loading, handleFetchMore, pageInfo } = useTrRecords();
  const { hasPreviousPage, hasNextPage } = pageInfo || {};

  return (
    <RecordTable.Provider
      columns={trRecordColumns}
      data={trRecords || []}
      stickyColumns={[]}
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
