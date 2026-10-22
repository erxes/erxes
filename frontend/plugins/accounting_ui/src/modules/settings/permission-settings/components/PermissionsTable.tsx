import { useTranslation } from 'react-i18next';
import { IconLockOff } from '@tabler/icons-react';
import { RecordTable, Skeleton, Table } from 'erxes-ui';
import { AccountingEmptyState } from '@/layout/components/AccountingEmptyState';
import { PERMISSIONS_CURSOR_SESSION_KEY } from '~/modules/accountsSessionKeys';
import { usePermissionsMain } from '@/settings/permission-settings/hooks/usePermissionsMain';
import { permissionsColumns } from '@/settings/permission-settings/components/PermissionsColumns';
import { PermissionsCommandbar } from '@/settings/permission-settings/components/PermissionsCommandBar';
import { useMemo } from 'react';

const PermissionsInitialSkeleton = ({ rows = 20 }: { rows?: number }) => {
  const { t } = useTranslation('accounting');
  const rowKeys = useMemo(
    () => Array.from({ length: rows }, () => crypto.randomUUID()),
    [rows],
  );
  return (
    <>
      {rowKeys.map((rowKey) => (
        <Table.Row key={rowKey} className="h-cell">
          {permissionsColumns(t).map((col, colIndex) => (
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
  const { permissionsMain, loading, error, handleFetchMore, pageInfo } =
    usePermissionsMain();
  const { hasPreviousPage, hasNextPage } = pageInfo || {};
  const isFetchingMore = loading && (permissionsMain?.length ?? 0) > 0;
  const isInitialLoading = loading && !isFetchingMore;

  const isEmpty = !loading && !permissionsMain?.length;

  return (
    <RecordTable.Provider
      columns={permissionsColumns(t)}
      data={isInitialLoading ? [] : permissionsMain || []}
      stickyColumns={['checkbox', 'accountName']}
      tableId="accounting_permissions_record_table"
      className="relative m-3"
    >
      <RecordTable.CursorProvider
        hasPreviousPage={hasPreviousPage}
        hasNextPage={hasNextPage}
        dataLength={permissionsMain?.length}
        sessionKey={PERMISSIONS_CURSOR_SESSION_KEY}
      >
        <RecordTable>
          <RecordTable.Header showColumnSelector />
          <RecordTable.Body>
            <RecordTable.CursorBackwardSkeleton
              handleFetchMore={handleFetchMore}
            />
            <RecordTable.RowList />
            {isInitialLoading && <PermissionsInitialSkeleton rows={20} />}
            <RecordTable.CursorForwardSkeleton
              handleFetchMore={handleFetchMore}
            />
          </RecordTable.Body>
        </RecordTable>
        <PermissionsCommandbar />
      </RecordTable.CursorProvider>
      {isEmpty && (
        <AccountingEmptyState
          overlay
          error={error}
          icon={IconLockOff}
          description={t('empty-filter-description')}
        />
      )}
    </RecordTable.Provider>
  );
};
