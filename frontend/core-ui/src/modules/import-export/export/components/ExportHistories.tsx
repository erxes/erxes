import { RecordTable } from 'erxes-ui';
import { useExportHistoriesRecordTable } from '../hooks/useExportHistoriesRecordTable';
import { ExportHistoriesEmptyState } from './ExportHistoriesEmptyState';
import { ExportHistoriesErrorState } from './ExportHistoriesErrorState';

export function ExportHistories() {
  const {
    error,
    list,
    loading,
    hasNextPage,
    hasPreviousPage,
    handleFetchMore,
    columns,
    contentTypes,
    RECORD_TABLE_SESSION_KEY,
    isEmpty,
  } = useExportHistoriesRecordTable();

  return (
    <RecordTable.Provider columns={columns} data={list} className="m-2">
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
            {error && (
              <ExportHistoriesErrorState columnsLength={columns.length} />
            )}
            <RecordTable.RowList />
            <RecordTable.CursorForwardSkeleton
              handleFetchMore={handleFetchMore}
            />
            {isEmpty && (
              <ExportHistoriesEmptyState
                columnsLength={columns.length}
                contentTypes={contentTypes}
              />
            )}
          </RecordTable.Body>
        </RecordTable>
      </RecordTable.CursorProvider>
    </RecordTable.Provider>
  );
}
