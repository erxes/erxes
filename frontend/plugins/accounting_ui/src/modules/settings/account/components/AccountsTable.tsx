import { useTranslation } from 'react-i18next';
import { useAccountsMain } from '@/settings/account/hooks/useAccountsMain';
import { IconDatabaseOff } from '@tabler/icons-react';
import { RecordTable } from 'erxes-ui';
import { AccountingEmptyState } from '@/layout/components/AccountingEmptyState';
import { AddAccount } from '@/settings/account/components/AddAccount';
import { accountsColumns } from '@/settings/account/components/AccountsColumns';
import { AccountsCommandbar } from '@/settings/account/components/AccountsCommandBar';
import { ACCOUNTS_CURSOR_SESSION_KEY } from '@/accountsSessionKeys';

export const AccountsTable = () => {
  const { t } = useTranslation('accounting');
  const { accountsMain, loading, error, handleFetchMore, pageInfo } =
    useAccountsMain();
  const { hasPreviousPage, hasNextPage } = pageInfo || {};
  const isFetchingMore = loading && (accountsMain?.length ?? 0) > 0;
  const isInitialLoading = loading && !isFetchingMore;

  const isEmpty = !loading && !accountsMain?.length;

  return (
    <RecordTable.Provider
      columns={accountsColumns(t)}
      data={isInitialLoading ? [] : accountsMain || []}
      stickyColumns={['more', 'checkbox', 'code']}
      tableId="accounting_accounts_record_table"
      className="relative m-3"
    >
      <RecordTable.CursorProvider
        hasPreviousPage={hasPreviousPage}
        hasNextPage={hasNextPage}
        dataLength={accountsMain?.length}
        sessionKey={ACCOUNTS_CURSOR_SESSION_KEY}
      >
        <RecordTable>
          <RecordTable.Header />
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
        <AccountsCommandbar />
      </RecordTable.CursorProvider>
      {isEmpty && (
        <AccountingEmptyState
          overlay
          error={error}
          icon={IconDatabaseOff}
          description={t('empty-list-description')}
          action={<AddAccount />}
        />
      )}
    </RecordTable.Provider>
  );
};
