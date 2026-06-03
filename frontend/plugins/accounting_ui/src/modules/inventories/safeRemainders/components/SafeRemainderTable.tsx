import { useMemo } from 'react';
import { RecordTable, Skeleton, Table } from 'erxes-ui';
import { useSafeRemainders } from '../hooks/useSafeRemainders';
import { safeRemainderColumns } from './SafeRemainderColumns';

const SafeRemainderInitialSkeleton = ({ rows = 20 }: { rows?: number }) => {
  const rowKeys = useMemo(
    () => Array.from({ length: rows }, (_, i) => `skeleton-row-${i}`),
    [rows],
  );
  return (
    <>
      {rowKeys.map((rowKey) => (
        <Table.Row key={rowKey} className="h-cell">
          {safeRemainderColumns.map((col, colIndex) => (
            <Table.Cell
              key={`${rowKey}-${col.id ?? colIndex}`}
              className="border-r-0 px-2"
            >
              <Skeleton className="h-4 w-full min-w-4" />
            </Table.Cell>
          ))}
        </Table.Row>
      ))}
    </>
  );
};

export const SafeRemainderTable = () => {
  const { safeRemainders, loading, totalCount, handleFetchMore } =
    useSafeRemainders();

  const isFetchingMore = loading && (safeRemainders?.length ?? 0) > 0;
  const isInitialLoading = loading && !isFetchingMore;

  return (
    <RecordTable.Provider
      columns={safeRemainderColumns}
      data={isInitialLoading ? [] : safeRemainders || []}
      stickyColumns={[]}
      className="m-3"
    >
      <RecordTable.Scroll>
        <RecordTable>
          <RecordTable.Header />
          <RecordTable.Body>
            <RecordTable.RowList />
            {isInitialLoading && <SafeRemainderInitialSkeleton rows={20} />}
            {!isInitialLoading && totalCount > (safeRemainders?.length ?? 0) && (
              <RecordTable.RowSkeleton
                rows={4}
                handleInView={handleFetchMore}
              />
            )}
          </RecordTable.Body>
        </RecordTable>
      </RecordTable.Scroll>
    </RecordTable.Provider>
  );
};
