import { IconRefresh } from '@tabler/icons-react';
import { Button, CommandBar, RecordTable, Separator } from 'erxes-ui';
import { useSyncProduct } from '../hooks/useSyncProduct';
import { ProductItem, ProductStatus } from '../types/productItem';

export const CheckProductCommandBar = () => {
  const { table } = RecordTable.useRecordTable();
  const selectedRows = table.getFilteredSelectedRowModel().rows;
  const selectedCount = selectedRows.length;
  const { syncProducts, loading } = useSyncProduct();

  const handleSync = async () => {
    const selectedItems = selectedRows.map(
      (row) => row.original as ProductItem,
    );

    await syncProducts(
      selectedItems,
      selectedItems[0]?.status as ProductStatus,
    );

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
