import { Button, CommandBar, RecordTable, Separator } from 'erxes-ui';

import { useCheckCategory } from '../hooks/useCheckCategory';

export const InventoryCategoryCommandBar = () => {
  const { loading, toSyncCategory } = useCheckCategory();
  const { table } = RecordTable.useRecordTable();
  const selectedRows = table.getFilteredSelectedRowModel().rows;

  const handleSync = async () => {
    const selectedItems = selectedRows.map((row) => row.original);
    await toSyncCategory(selectedItems);
    table.resetRowSelection();
  };

  return (
    <CommandBar open={selectedRows.length > 0}>
      <CommandBar.Bar>
        <CommandBar.Value onClose={() => table.resetRowSelection()}>
          {selectedRows.length} selected
        </CommandBar.Value>
        <Separator.Inline />
        <Button variant="secondary" onClick={handleSync} disabled={loading}>
          Sync
        </Button>
      </CommandBar.Bar>
    </CommandBar>
  );
};
