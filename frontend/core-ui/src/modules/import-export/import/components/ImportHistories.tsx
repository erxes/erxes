import { RecordTable } from 'erxes-ui';
import { useImportHistoriesRecordTable } from '../hooks/useImportHistoriesRecordTable';
import { ImportHistoriesRecordTableProvider } from './ImportHistoriesContext';
import { ImportHistoriesEmptyState } from './ImportHistoriesEmptyState';
import { ImportHistoriesErrorState } from './ImportHistoriesErrorStatet';
import { ImportHistoriesRecordTableHeader } from './ImportHistoriesRecordTableHeader';

export function ImportHistories() {
  const {
    error,
    list,
    loading,
    hasNextPage,
    hasPreviousPage,
    handleFetchMore,
    columns,
    providerValue,
    RECORD_TABLE_SESSION_KEY,
    isEmpty,
  } = useImportHistoriesRecordTable();

  return (
    <ImportHistoriesRecordTableProvider value={providerValue}>
      <div className="space-y-4 w-full">
        <ImportHistoriesRecordTableHeader />

        <RecordTable.Provider
          columns={columns}
          data={list}
          className="overflow-hidden rounded-xl border bg-background"
        >
          <RecordTable.CursorProvider
            hasPreviousPage={hasPreviousPage}
            hasNextPage={hasNextPage}
            dataLength={list.length}
            sessionKey={RECORD_TABLE_SESSION_KEY}
          >
            <RecordTable>
              <RecordTable.Header />
              <RecordTable.Body>
                <RecordTable.CursorBackwardSkeleton
                  handleFetchMore={handleFetchMore}
                />
                {loading && <RecordTable.RowSkeleton rows={20} />}
                {error && <ImportHistoriesErrorState />}
                <RecordTable.RowList />
                <RecordTable.CursorForwardSkeleton
                  handleFetchMore={handleFetchMore}
                />
                {isEmpty && <ImportHistoriesEmptyState />}
              </RecordTable.Body>
            </RecordTable>
          </RecordTable.CursorProvider>
        </RecordTable.Provider>
      </div>
    </ImportHistoriesRecordTableProvider>
  );
}
