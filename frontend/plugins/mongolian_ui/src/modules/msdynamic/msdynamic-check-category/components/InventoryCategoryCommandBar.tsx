import { Button, CommandBar, RecordTable, Separator } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

import { useCheckCategory } from '../hooks/useCheckCategory';

export const InventoryCategoryCommandBar = () => {
  const { t } = useTranslation('mongolian');
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
          {selectedRows.length} {t('selected')}
        </CommandBar.Value>
        <Separator.Inline />
        <Button variant="secondary" onClick={handleSync} disabled={loading}>
          {t('sync')}
        </Button>
      </CommandBar.Bar>
    </CommandBar>
  );
};
