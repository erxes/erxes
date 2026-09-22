import { useMemo } from 'react';
import { RecordTable, Skeleton, Table } from 'erxes-ui';
import { safeRemainderColumns } from './SafeRemainderColumns';
import { ISafeRemainder } from '../types/SafeRemainder';

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

export const SafeRemainderTable = ({
  handleFetchMore,
  loading,
  safeRemainders,
  totalCount,
}: {
  handleFetchMore: () => void;
  loading: boolean;
  safeRemainders?: ISafeRemainder[];
  totalCount?: number;
}) => {
  const isFetchingMore = loading && (safeRemainders?.length ?? 0) > 0;
  const isInitialLoading = loading && !isFetchingMore;
  const safeRemaindersCount = safeRemainders?.length ?? 0;
  const totalSafeRemaindersCount = totalCount ?? 0;

  return (
    <RecordTable.Provider
      columns={safeRemainderColumns}
      data={isInitialLoading ? [] : safeRemainders || []}
      stickyColumns={['more']}
      tableId="accounting_safe_remainders_record_table"
      className="m-3"
    >
      <RecordTable.Scroll>
        <RecordTable>
          <RecordTable.Header />
          <RecordTable.Body>
            <RecordTable.RowList />
            {isInitialLoading && <SafeRemainderInitialSkeleton rows={20} />}
            {!isInitialLoading &&
              totalSafeRemaindersCount > safeRemaindersCount && (
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
