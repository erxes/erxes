import { IconRefresh } from '@tabler/icons-react';
import { Button, CommandBar, RecordTable, Separator } from 'erxes-ui';
import { useSyncCategory } from '../hooks/useSyncCategory';
import { CategoryItem, CategoryStatus } from '../types/categoryItem';

export const CheckCategoryCommandBar = () => {
  const { table } = RecordTable.useRecordTable();
  const selectedRows = table.getFilteredSelectedRowModel().rows;
  const selectedCount = selectedRows.length;
  const { syncCategories, loading } = useSyncCategory();

  const handleSync = async () => {
    const selectedItems = selectedRows.map(
      (row) => row.original as CategoryItem,
    );

    await syncCategories(
      selectedItems,
      selectedItems[0]?.status as CategoryStatus,
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
