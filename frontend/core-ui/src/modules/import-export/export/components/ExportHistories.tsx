import { RecordTable } from 'erxes-ui';
import { useExportHistoriesRecordTable } from '../hooks/useExportHistoriesRecordTable';
import { ExportHistoriesRecordTableProvider } from './ExportHistoriesContext';
import { ExportHistoriesEmptyState } from './ExportHistoriesEmptyState';
import { ExportHistoriesErrorState } from './ExportHistoriesErrorState';
import { ExportHistoriesRecordTableHeader } from './ExportHistoriesRecordTableHeader';

export function ExportHistories() {
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
  } = useExportHistoriesRecordTable();

  return (
    <ExportHistoriesRecordTableProvider value={providerValue}>
      <div className="min-w-0 w-full space-y-4">
        <ExportHistoriesRecordTableHeader />

        <RecordTable.Provider
          columns={columns}
          data={list}
          className="min-w-0 overflow-hidden rounded-xl border bg-background"
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
                {error && <ExportHistoriesErrorState />}
                <RecordTable.RowList />
                <RecordTable.CursorForwardSkeleton
                  handleFetchMore={handleFetchMore}
                />
                {isEmpty && <ExportHistoriesEmptyState />}
              </RecordTable.Body>
            </RecordTable>
          </RecordTable.CursorProvider>
        </RecordTable.Provider>
      </div>
    </ExportHistoriesRecordTableProvider>
  );
}
