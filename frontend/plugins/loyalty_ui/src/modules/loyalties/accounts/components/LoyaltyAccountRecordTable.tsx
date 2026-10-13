import { IconWallet } from '@tabler/icons-react';
import { RecordTable, Spinner } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { LOYALTY_ACCOUNT_CURSOR_SESSION_KEY } from '../constants/accountList';
import { useLoyaltyAccountTable } from '../hooks/useLoyaltyAccountTable';

export const LoyaltyAccountRecordTable = () => {
  const { t } = useTranslation('loyalty');
  const { list, loading, handleFetchMore, pageInfo, columns, columnsKey } =
    useLoyaltyAccountTable();

  if (loading && !list.length) {
    return <Spinner />;
  }

  return (
    <RecordTable.Provider
      key={columnsKey}
      columns={columns}
      data={list}
      className="m-3 relative"
      stickyColumns={['more', 'ownerName']}
      tableId="loyalty_accounts_record_table"
    >
      <RecordTable.CursorProvider
        hasPreviousPage={pageInfo?.hasPreviousPage}
        hasNextPage={pageInfo?.hasNextPage}
        dataLength={list.length}
        sessionKey={LOYALTY_ACCOUNT_CURSOR_SESSION_KEY}
      >
        <RecordTable>
          <RecordTable.Header />
          <RecordTable.Body>
            <RecordTable.CursorBackwardSkeleton
              handleFetchMore={handleFetchMore}
            />
            {loading ? (
              <RecordTable.RowSkeleton rows={32} />
            ) : (
              <RecordTable.RowList />
            )}
            <RecordTable.CursorForwardSkeleton
              handleFetchMore={handleFetchMore}
            />
          </RecordTable.Body>
        </RecordTable>

        {!loading && !list.length && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex flex-col items-center text-center">
              <IconWallet size={48} className="mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold">
                {t('loyalty-accounts-empty')}
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {t('loyalty-accounts-empty-hint')}
              </p>
            </div>
          </div>
        )}
      </RecordTable.CursorProvider>
    </RecordTable.Provider>
  );
};
