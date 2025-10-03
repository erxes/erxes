import { useTrRecords } from '../hooks/useTrRecords';
import { trRecordColumns } from './TrRecordsTableColumns';
import { RecordTable } from 'erxes-ui';

export const TrRecordTable = () => {
  const { trRecords, loading, totalCount, handleFetchMore } = useTrRecords();

  return (
    <RecordTable.Provider
      columns={trRecordColumns}
      data={trRecords || []}
      stickyColumns={[]}
      className="m-3"
    >
      <RecordTable>
        <RecordTable.Header />
        <RecordTable.Body>
          <RecordTable.RowList />
          {!loading && totalCount > trRecords?.length && (
            <RecordTable.RowSkeleton rows={4} handleInView={handleFetchMore} />
          )}
        </RecordTable.Body>
      </RecordTable>
    </RecordTable.Provider>
  );
};
