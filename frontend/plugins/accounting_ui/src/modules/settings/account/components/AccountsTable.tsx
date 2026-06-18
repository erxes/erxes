import { useAccountsMain } from '@/settings/account/hooks/useAccountsMain';
import { RecordTable, Skeleton, Table } from 'erxes-ui';
import { accountsColumns } from '@/settings/account/components/AccountsColumns';
import { AccountsCommandbar } from './AccountsCommandBar';
import { ACCOUNTS_CURSOR_SESSION_KEY } from '../../../accountsSessionKeys';
import { useMemo } from 'react';

const AccountsInitialSkeleton = ({ rows = 20 }: { rows?: number }) => {
  const rowKeys = useMemo(
    () => Array.from({ length: rows }, () => crypto.randomUUID()),
    [rows],
  );
  return (
    <>
      {rowKeys.map((rowKey) => (
        <Table.Row key={rowKey} className="h-cell">
          {accountsColumns.map((col, colIndex) => (
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

export const AccountsTable = () => {
  const { accountsMain, loading, handleFetchMore, pageInfo } =
    useAccountsMain();
  const { hasPreviousPage, hasNextPage } = pageInfo || {};
  const isFetchingMore = loading && (accountsMain?.length ?? 0) > 0;
  const isInitialLoading = loading && !isFetchingMore;

  return (
    <RecordTable.Provider
      columns={accountsColumns}
      data={isInitialLoading ? [] : accountsMain || []}
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
            <RecordTable.RowList />
            {isInitialLoading && <AccountsInitialSkeleton rows={20} />}
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
