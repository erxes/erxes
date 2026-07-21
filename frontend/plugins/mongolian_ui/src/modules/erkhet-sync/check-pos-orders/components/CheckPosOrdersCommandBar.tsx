import { Button, CommandBar, RecordTable, Separator } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { useCheckPosOrders } from '../hooks/useCheckPosOrders';

export const CheckPosOrdersCommandBar = () => {
  const { t } = useTranslation('mongolian');
  const {
    checking,
    syncing,
    checkOrders,
    syncUncheckedOrders,
    syncSelectedOrderIds,
    setAllOrdersToSync,
  } = useCheckPosOrders();
  const { table } = RecordTable.useRecordTable();
  const selectedRows = table.getFilteredSelectedRowModel().rows;
  const selectedIds = selectedRows
    .map((row) => row.original._id)
    .filter(Boolean);

  const commandBarOpen =
    selectedRows.length > 0 || syncSelectedOrderIds.length > 0;
  const selectedCount = selectedRows.length || syncSelectedOrderIds.length;

  const handleCheck = async () => {
    await checkOrders(selectedIds);
    table.resetRowSelection();
  };

  const handleSync = async () => {
    await syncUncheckedOrders(syncSelectedOrderIds);
    table.resetRowSelection();
  };

  const handleClose = () => {
    table.resetRowSelection();
    setAllOrdersToSync(syncSelectedOrderIds, false);
  };

  return (
    <CommandBar open={commandBarOpen}>
      <CommandBar.Bar>
        <CommandBar.Value onClose={handleClose}>
          {selectedCount} {t('selected', 'selected')}
        </CommandBar.Value>
        <Separator.Inline />
        <Button
          variant="secondary"
          onClick={handleCheck}
          disabled={checking || !selectedIds.length}
        >
          {checking ? t('checking', 'Checking...') : t('check', 'Check')}
        </Button>
        <Button
          variant="secondary"
          onClick={handleSync}
          disabled={syncing || !syncSelectedOrderIds.length}
        >
          {syncing ? t('syncing', 'Syncing...') : t('sync', 'Sync')}
        </Button>
      </CommandBar.Bar>
    </CommandBar>
  );
};
