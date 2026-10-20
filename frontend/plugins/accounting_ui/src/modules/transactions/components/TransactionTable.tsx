import { useTranslation } from 'react-i18next';
import { IconReceiptOff } from '@tabler/icons-react';
import { RecordTable } from 'erxes-ui';
import { AccountingEmptyState } from '@/layout/components/AccountingEmptyState';
import { AddTransactionEmptyAction } from '@/transactions/components/AddTransactionEmptyAction';
import { ACCTRANSACTIONS_CURSOR_SESSION_KEY } from '~/modules/accountsSessionKeys';
import { useTransactions } from '@/transactions/hooks/useTransactions';
import { AccountingTableRow } from '@/transactions/components/AccountingTableRow';
import { transactionColumns } from '@/transactions/components/TransactionsTableColumns';
import { TransactionCommandBar } from '@/transactions/components/TransactionCommandBar';

export const TransactionTable = () => {
  const { t } = useTranslation('accounting');
  const { transactions, loading, error, handleFetchMore, pageInfo } =
    useTransactions();
  const { hasPreviousPage, hasNextPage } = pageInfo || {};

  const isEmpty = !loading && !transactions?.length;

  return (
    <RecordTable.Provider
      columns={transactionColumns(t)}
      data={transactions || []}
      stickyColumns={['more', 'checkbox', 'account']}
      tableId="accounting_transactions_record_table"
      className="relative m-3"
    >
      <RecordTable.CursorProvider
        hasPreviousPage={hasPreviousPage}
        hasNextPage={hasNextPage}
        dataLength={transactions?.length}
        sessionKey={ACCTRANSACTIONS_CURSOR_SESSION_KEY}
      >
        <RecordTable>
          <RecordTable.Header />
          <RecordTable.Body>
            <RecordTable.CursorBackwardSkeleton
              handleFetchMore={handleFetchMore}
            />
            {loading && <RecordTable.RowSkeleton rows={40} />}
            <AccountingTableRow />
            <RecordTable.CursorForwardSkeleton
              handleFetchMore={handleFetchMore}
            />
          </RecordTable.Body>
        </RecordTable>
      </RecordTable.CursorProvider>
      <TransactionCommandBar />
      {isEmpty && (
        <AccountingEmptyState
          overlay
          error={error}
          icon={IconReceiptOff}
          title={t('no-transactions')}
          description={t('empty-list-description')}
          action={<AddTransactionEmptyAction />}
        />
      )}
    </RecordTable.Provider>
  );
};
