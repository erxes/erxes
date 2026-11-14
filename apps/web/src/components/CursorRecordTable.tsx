import { RecordTable, type RecordTableColumnDef } from 'erxes-ui';
import type { ReactNode } from 'react';
import { messageOf } from '@erxes/core-contract/client';
import type { useCursorList } from '~/lib/cursorList';
import { EmptyList } from './EmptyList';

/**
 * A keyset list (`useCursorList`) as a record table that loads more at either end:
 * its failure, its rows, `empty` (EmptyList by default) when there are none, and
 * `children` (a command bar) over it.
 */
export const CursorRecordTable = <T extends { id: string }>({
  cursor: { sessionKey, list, loading, error, hasNextPage, hasPreviousPage, handleFetchMore },
  columns,
  stickyColumns,
  tableId,
  empty = <EmptyList />,
  children,
}: {
  cursor: ReturnType<typeof useCursorList<T>>;
  columns: RecordTableColumnDef<T>[];
  stickyColumns: string[];
  tableId: string;
  empty?: ReactNode;
  children?: ReactNode;
}) => {
  if (error) {
    return <div className="m-3 text-sm text-destructive">{messageOf(error)}</div>;
  }

  return (
    <RecordTable.Provider
      columns={columns}
      data={list}
      stickyColumns={stickyColumns}
      className="m-3"
      tableId={tableId}
    >
      <RecordTable.CursorProvider
        hasPreviousPage={hasPreviousPage}
        hasNextPage={hasNextPage}
        dataLength={list.length}
        sessionKey={sessionKey}
      >
        <RecordTable>
          <RecordTable.Header />
          <RecordTable.Body>
            <RecordTable.CursorBackwardSkeleton handleFetchMore={handleFetchMore} />
            {loading ? <RecordTable.RowSkeleton rows={32} /> : <RecordTable.RowList />}
            <RecordTable.CursorForwardSkeleton handleFetchMore={handleFetchMore} />
          </RecordTable.Body>
        </RecordTable>
      </RecordTable.CursorProvider>
      {!loading && !list.length && empty}
      {children}
    </RecordTable.Provider>
  );
};
