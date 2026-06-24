import { CommandBar, Separator, Button, RecordTable } from 'erxes-ui';
import { useCheckCustomer } from '../hooks/useCheckCustomer';

export const CheckCustomerCommandBar = () => {
  const { table } = RecordTable.useRecordTable();
  const selectedRows = table.getFilteredSelectedRowModel().rows;
  const { syncCustomers, syncing } = useCheckCustomer();

  const handleSync = async () => {
    const selectedCustomers = selectedRows.map((row) => row.original);
    await syncCustomers(selectedCustomers);
    table.resetRowSelection();
  };

  return (
    <CommandBar open={selectedRows.length > 0}>
      <CommandBar.Bar>
        <CommandBar.Value>{selectedRows.length} selected</CommandBar.Value>
        <Separator.Inline />
        <Button variant="secondary" onClick={handleSync} disabled={syncing}>
          {syncing ? 'Syncing...' : 'Sync'}
        </Button>
      </CommandBar.Bar>
    </CommandBar>
  );
};
