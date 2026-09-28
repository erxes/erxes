import { CommandBar, RecordTable, Separator } from 'erxes-ui';
import { Can, Export } from 'ui-modules';
import { ITransaction } from '../../types/Transaction';
import { useTransactionsFilterVariables } from '../../hooks/useTransactionVars';
import { TransactionDelete } from './TransactionDelete';

export const TransactionCommandBar = () => {
  const { table } = RecordTable.useRecordTable();
  const filterVariables = useTransactionsFilterVariables();

  const selectedRows = table.getFilteredSelectedRowModel().rows;
  const transactions = selectedRows.map((row) => row.original as ITransaction);
  const transactionIds = transactions
    .map((transaction) => transaction._id)
    .filter((id): id is string => Boolean(id));

  return (
    <CommandBar open={selectedRows.length > 0}>
      <CommandBar.Bar>
        <CommandBar.Value>{selectedRows.length} selected</CommandBar.Value>
        <Separator.Inline />
        <Can action="transactionsExportManage">
          <Export
            pluginName="accounting"
            moduleName="account"
            collectionName="transactions"
            buttonVariant="secondary"
            ids={transactionIds}
            getFilters={() => filterVariables}
          />
          <Separator.Inline />
        </Can>
        <TransactionDelete transactions={transactions} rows={selectedRows} />
      </CommandBar.Bar>
    </CommandBar>
  );
};
