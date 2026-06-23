import { IconRefresh } from '@tabler/icons-react';
import { Button, CommandBar, RecordTable, Separator } from 'erxes-ui';

interface CheckSyncedCommandBarProps<TData extends { status: string }> {
  sync: (items: TData[], status: TData['status']) => Promise<unknown>;
  loading: boolean;
}

export const CheckSyncedCommandBar = <TData extends { status: string }>({
  sync,
  loading,
}: CheckSyncedCommandBarProps<TData>) => {
  const { table } = RecordTable.useRecordTable();
  const selectedRows = table.getFilteredSelectedRowModel().rows;
  const selectedCount = selectedRows.length;

  const handleSync = async () => {
    const selectedItems = selectedRows.map((row) => row.original) as TData[];

    await sync(selectedItems, selectedItems[0]!.status);

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
