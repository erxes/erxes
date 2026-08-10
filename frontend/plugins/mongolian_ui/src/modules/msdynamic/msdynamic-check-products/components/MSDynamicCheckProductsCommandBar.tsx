import { Button, CommandBar, RecordTable, Separator } from 'erxes-ui';

import { useMSDynamicCheckProducts } from '../hooks/useMSDynamicCheckProducts';

export const MSDynamicCheckProductsCommandBar = () => {
  const { syncing, checking, syncProducts } = useMSDynamicCheckProducts();
  const { table } = RecordTable.useRecordTable();
  const selectedRows = table.getFilteredSelectedRowModel().rows;

  const handleSync = async () => {
    const selectedItems = selectedRows.map((row) => row.original);
    await syncProducts(selectedItems);
    table.resetRowSelection();
  };

  return (
    <CommandBar open={selectedRows.length > 0}>
      <CommandBar.Bar>
        <CommandBar.Value onClose={() => table.resetRowSelection()}>
          {selectedRows.length} selected
        </CommandBar.Value>
        <Separator.Inline />
        <Button
          variant="secondary"
          onClick={handleSync}
          disabled={syncing || checking}
        >
          Sync
        </Button>
      </CommandBar.Bar>
    </CommandBar>
  );
};
