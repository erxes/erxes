import { Row } from '@tanstack/table-core';
import { CommandBar, RecordTable, Separator } from 'erxes-ui';
import { TransactionDelete } from './TransactionDelete';

export const TransactionCommandBar = () => {
  const { table } = RecordTable.useRecordTable();

  const selectedRows = table.getFilteredSelectedRowModel().rows;
  const transactions = selectedRows.map((row: Row<any>) => row.original);

  return (
    <CommandBar open={selectedRows.length > 0}>
      <CommandBar.Bar>
        <CommandBar.Value>{selectedRows.length} selected</CommandBar.Value>
        <Separator.Inline />
        <TransactionDelete transactions={transactions} rows={selectedRows} />
      </CommandBar.Bar>
    </CommandBar>
  );
};
