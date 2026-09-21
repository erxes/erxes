import { RecordTable } from 'erxes-ui';
import { useImportHistoriesRecordTable } from '../hooks/useImportHistoriesRecordTable';
import { ImportHistoriesEmptyState } from './ImportHistoriesEmptyState';
import { ImportHistoriesErrorState } from './ImportHistoriesErrorStatet';

export function ImportHistories() {
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
  } = useImportHistoriesRecordTable();

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
              <ImportHistoriesErrorState columnsLength={columns.length} />
            )}
            <RecordTable.RowList />
            <RecordTable.CursorForwardSkeleton
              handleFetchMore={handleFetchMore}
            />
            {isEmpty && (
              <ImportHistoriesEmptyState
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
