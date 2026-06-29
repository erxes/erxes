import { Button, CommandBar, RecordTable, Separator } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { useCheckSyncedDeals } from '../hooks/useCheckSyncedDeals';

export const CheckSyncedDealsCommandBar = () => {
  const { t } = useTranslation('mongolian');
  const { checking, syncing, checkDeals, syncUncheckedDeals, syncSelectedDealIds } =
    useCheckSyncedDeals();
  const { table } = RecordTable.useRecordTable();
  const selectedRows = table.getFilteredSelectedRowModel().rows;
  const selectedIds = selectedRows
    .map((row) => row.original._id)
    .filter(Boolean);

  const handleCheck = async () => {
    await checkDeals(selectedIds);
    table.resetRowSelection();
  };

  const handleSync = async () => {
    await syncUncheckedDeals(syncSelectedDealIds);
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
          disabled={syncing || !syncSelectedDealIds.length}
        >
          {syncing ? t('syncing') : t('sync')}
        </Button>
      </CommandBar.Bar>
    </CommandBar>
  );
};
