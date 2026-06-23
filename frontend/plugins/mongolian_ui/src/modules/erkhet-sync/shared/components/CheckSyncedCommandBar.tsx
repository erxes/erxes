import { IconRefresh } from '@tabler/icons-react';
import { Button, CommandBar, RecordTable, Separator } from 'erxes-ui';

interface CheckSyncedCommandBarProps<T extends { status: string }> {
  sync: (items: T[], status: T['status']) => Promise<T[] | undefined>;
  loading: boolean;
  onSynced?: (items: T[]) => void;
}

export const CheckSyncedCommandBar = <T extends { status: string }>({
  sync,
  loading,
  onSynced,
}: CheckSyncedCommandBarProps<T>) => {
  const { table } = RecordTable.useRecordTable();
  const selectedRows = table.getFilteredSelectedRowModel().rows;
  const selectedCount = selectedRows.length;

  const handleSync = async () => {
    const selectedItems = selectedRows.map((row) => row.original) as T[];
    const updatedItems = await sync(
      selectedItems,
      selectedItems[0]?.status as T['status'],
    );
    if (updatedItems) onSynced?.(updatedItems);

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
