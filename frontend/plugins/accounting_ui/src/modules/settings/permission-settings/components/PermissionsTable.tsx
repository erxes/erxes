import { RecordTable, Skeleton, Table } from 'erxes-ui';
import { PERMISSIONS_CURSOR_SESSION_KEY } from '~/modules/accountsSessionKeys';
import { usePermissionsMain } from '../hooks/usePermissionsMain';
import { permissionsColumns } from './PermissionsColumns';
import { PermissionsCommandbar } from './PermissionsCommandBar';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

const PermissionsInitialSkeleton = ({
  rows = 20,
  columns,
}: {
  rows?: number;
  columns: ReturnType<typeof permissionsColumns>;
}) => {
  const rowKeys = useMemo(
    () => Array.from({ length: rows }, () => crypto.randomUUID()),
    [rows],
  );
  return (
    <>
      {rowKeys.map((rowKey) => (
        <Table.Row key={rowKey} className="h-cell">
          {columns.map((col, colIndex) => (
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

export const PermissionsTable = () => {
  const { t } = useTranslation('accounting');
  const { permissionsMain, loading, handleFetchMore, pageInfo } =
    usePermissionsMain();
  const { hasPreviousPage, hasNextPage } = pageInfo || {};
  const isFetchingMore = loading && (permissionsMain?.length ?? 0) > 0;
  const isInitialLoading = loading && !isFetchingMore;
  const columns = useMemo(() => permissionsColumns(t), [t]);

  return (
    <RecordTable.Provider
      columns={columns}
      data={isInitialLoading ? [] : permissionsMain || []}
      stickyColumns={['checkbox', 'accountName']}
      className="m-3"
    >
      <RecordTable.CursorProvider
        hasPreviousPage={hasPreviousPage}
        hasNextPage={hasNextPage}
        dataLength={permissionsMain?.length}
        sessionKey={PERMISSIONS_CURSOR_SESSION_KEY}
      >
        <RecordTable>
          <RecordTable.Header />
          <RecordTable.Body>
            <RecordTable.CursorBackwardSkeleton
              handleFetchMore={handleFetchMore}
            />
            <RecordTable.RowList />
            {isInitialLoading && (
              <PermissionsInitialSkeleton rows={20} columns={columns} />
            )}
            <RecordTable.CursorForwardSkeleton
              handleFetchMore={handleFetchMore}
            />
          </RecordTable.Body>
        </RecordTable>
        <PermissionsCommandbar />
      </RecordTable.CursorProvider>
    </RecordTable.Provider>
  );
};
