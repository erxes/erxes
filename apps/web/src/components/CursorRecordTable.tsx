import type { ViewRecordType } from '@erxes/core-contract';
import { ListFilterEmpty, RecordTable, type RecordTableColumnDef } from 'erxes-ui';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { messageOf } from '@erxes/core-contract/client';
import type { useCursorList } from '~/lib/cursorList';
import { EmptyList } from './EmptyList';

/** "No customers match these filters" while the list is filtered; `fallback` otherwise. */
const FilteredEmpty = ({
  recordType,
  fallback,
}: {
  recordType?: ViewRecordType;
  fallback: ReactNode;
}) => {
  const { t } = useTranslation('views', { keyPrefix: 'filter' });

  return (
    <ListFilterEmpty
      records={recordType ? t(`nouns.${recordType}`, 'records') : undefined}
      fallback={fallback}
    />
  );
};

/**
 * A keyset list (`useCursorList`) as a record table that loads more at either end:
 * its failure, its rows, `empty` (EmptyList by default) when there are none, and
 * `children` (a command bar) over it. Filtered by `ListFilter` and empty, it says no
 * `recordType` records match and offers to clear the filters.
 */
export const CursorRecordTable = <T extends { id: string }>({
  cursor: { sessionKey, list, loading, error, hasNextPage, hasPreviousPage, handleFetchMore },
  columns,
  stickyColumns,
  tableId,
  recordType,
  empty = <EmptyList />,
  children,
}: {
  cursor: ReturnType<typeof useCursorList<T>>;
  columns: RecordTableColumnDef<T>[];
  stickyColumns: string[];
  tableId: string;
  recordType?: ViewRecordType;
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
      {!loading && !list.length && <FilteredEmpty recordType={recordType} fallback={empty} />}
      {children}
    </RecordTable.Provider>
  );
};
