import { ACCTRANSACTIONS_CURSOR_SESSION_KEY } from '~/modules/accountsSessionKeys';
import { useTransactions } from '../hooks/useTransactions';
import { AccountingTableRow } from './AccountingTableRow';
import { transactionColumns } from './TransactionsTableColumns';
import { RecordTable } from 'erxes-ui';


export const TransactionTable = () => {
  const { transactions, loading, handleFetchMore, pageInfo } =
    useTransactions();
  const { hasPreviousPage, hasNextPage } = pageInfo || {};

  return (
    <RecordTable.Provider
      columns={transactionColumns}
      data={transactions || []}
      stickyColumns={[]}
      className='m-3'
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
    </RecordTable.Provider>
  );
};
