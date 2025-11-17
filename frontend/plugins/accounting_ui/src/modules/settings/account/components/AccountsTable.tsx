import { useAccountsMain } from '@/settings/account/hooks/useAccounts';
import { RecordTable } from 'erxes-ui';
import { accountsColumns } from '@/settings/account/components/AccountsColumns';
import { AccountsCommandbar } from './AccountsCommandBar';
import { ACCOUNTS_CURSOR_SESSION_KEY } from '../../../accountsSessionKeys';

export const AccountsTable = () => {
  const { accountsMain, loading, handleFetchMore, pageInfo } = useAccountsMain();
  const { hasPreviousPage, hasNextPage } = pageInfo || {};

  return (
    <RecordTable.Provider
      columns={accountsColumns}
      data={accountsMain || []}
      stickyColumns={['more', 'checkbox', 'code']}
      className="m-3"
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
            {loading && <RecordTable.RowSkeleton rows={40} />}
            <RecordTable.RowList />
            <RecordTable.CursorForwardSkeleton
              handleFetchMore={handleFetchMore}
            />
          </RecordTable.Body>
        </RecordTable>
        <AccountsCommandbar />
      </RecordTable.CursorProvider>
    </RecordTable.Provider>
  );
};
