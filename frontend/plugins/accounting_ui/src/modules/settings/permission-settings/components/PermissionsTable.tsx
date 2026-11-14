import { useTranslation } from 'react-i18next';
import { IconLockOff } from '@tabler/icons-react';
import { RecordTable } from 'erxes-ui';
import { AccountingEmptyState } from '@/layout/components/AccountingEmptyState';
import { PERMISSIONS_CURSOR_SESSION_KEY } from '~/modules/accountsSessionKeys';
import { usePermissionsMain } from '@/settings/permission-settings/hooks/usePermissionsMain';
import { permissionsColumns } from '@/settings/permission-settings/components/PermissionsColumns';
import { PermissionsCommandbar } from '@/settings/permission-settings/components/PermissionsCommandBar';

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
            {isInitialLoading && <RecordTable.RowSkeleton rows={20} />}
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
