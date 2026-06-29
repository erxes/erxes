import { Button, CommandBar, RecordTable, Separator } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { useCheckPosOrders } from '../hooks/useCheckPosOrders';

export const CheckPosOrdersCommandBar = () => {
  const { t } = useTranslation('mongolian');
  const { checking, syncing, checkOrders, syncUncheckedOrders, syncSelectedOrderIds } =
    useCheckPosOrders();
  const { table } = RecordTable.useRecordTable();
  const selectedRows = table.getFilteredSelectedRowModel().rows;
  const selectedIds = selectedRows
    .map((row) => row.original._id)
    .filter(Boolean);

  const handleCheck = async () => {
    await checkOrders(selectedIds);
    table.resetRowSelection();
  };

  const handleSync = async () => {
    await syncUncheckedOrders(syncSelectedOrderIds);
    table.resetRowSelection();
  };

  return (
    <CommandBar open={selectedRows.length > 0}>
      <CommandBar.Bar>
        <CommandBar.Value onClose={() => table.resetRowSelection()}>
          {selectedRows.length} {t('selected')}
        </CommandBar.Value>
        <Separator.Inline />
        <Button
          variant="secondary"
          onClick={handleCheck}
          disabled={checking || !selectedIds.length}
        >
          {checking ? t('checking') : t('check')}
        </Button>
        <Button
          variant="secondary"
          onClick={handleSync}
          disabled={syncing || !syncSelectedOrderIds.length}
        >
          {syncing ? t('syncing') : t('sync')}
        </Button>
      </CommandBar.Bar>
    </CommandBar>
  );
};
