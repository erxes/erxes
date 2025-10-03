import { useTransactions } from '../hooks/useTransactions';
import { AccountingTableRow } from './AccountingTableRow';
import { transactionColumns } from './TransactionsTableColumns';
import { RecordTable } from 'erxes-ui';

export const TransactionTable = () => {
  const { transactions, loading, totalCount, handleFetchMore } =
    useTransactions();

  return (
    <RecordTable.Provider
      columns={transactionColumns}
      data={transactions || []}
      stickyColumns={[]}
      className='m-3'
    >
      <RecordTable.Scroll>
        <RecordTable>
          <RecordTable.Header />
          <RecordTable.Body>
            <AccountingTableRow />
            {!loading && totalCount > transactions?.length && (
              <RecordTable.RowSkeleton rows={4} handleInView={handleFetchMore} />
            )}
          </RecordTable.Body>
        </RecordTable>
      </RecordTable.Scroll>
    </RecordTable.Provider>
  );
};
