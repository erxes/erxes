import { Button, CommandBar, RecordTable, Separator } from 'erxes-ui';
import { useCheckPrice } from '../hooks/useCheckPrice';

export const CheckPriceCommandBar = () => {
  const { handleSync, syncing } = useCheckPrice();
  const { table } = RecordTable.useRecordTable();
  const selectedRows = table.getFilteredSelectedRowModel().rows;

  const handleSyncSelected = async () => {
    const selectedPrices = selectedRows.map((row) => row.original);
    await handleSync(selectedPrices);
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
          onClick={handleSyncSelected}
          disabled={syncing}
        >
          Sync
        </Button>
      </CommandBar.Bar>
    </CommandBar>
  );
};
