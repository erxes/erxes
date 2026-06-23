import { IconRefresh } from '@tabler/icons-react';
import { Button, CommandBar, RecordTable, Separator } from 'erxes-ui';

interface CheckSyncedCommandBarProps {
  sync: (...args: any[]) => any;
  loading: boolean;
}

export const CheckSyncedCommandBar = ({
  sync,
  loading,
}: CheckSyncedCommandBarProps) => {
  const { table } = RecordTable.useRecordTable();
  const selectedRows = table.getFilteredSelectedRowModel().rows;
  const selectedCount = selectedRows.length;

  const handleSync = async () => {
    const selectedItems = selectedRows.map((row) => row.original);

    await sync(selectedItems, selectedItems[0]?.status);

    table.setRowSelection({});
  };

  return (
    <CommandBar open={selectedCount > 0}>
      <CommandBar.Bar>
        <CommandBar.Value onClose={() => table.setRowSelection({})}>
          {selectedCount} selected
        </CommandBar.Value>
        <Separator.Inline />
        <Button variant="secondary" disabled={loading} onClick={handleSync}>
          <IconRefresh />
          {loading ? 'Syncing...' : 'Sync'}
        </Button>
      </CommandBar.Bar>
    </CommandBar>
  );
};
