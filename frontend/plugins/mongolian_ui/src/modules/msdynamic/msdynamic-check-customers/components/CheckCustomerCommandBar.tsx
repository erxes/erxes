import { CommandBar, Separator, Button, RecordTable } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { useCheckCustomer } from '../hooks/useCheckCustomer';

export const CheckCustomerCommandBar = () => {
  const { t } = useTranslation('mongolian');
  const { table } = RecordTable.useRecordTable();
  const selectedRows = table.getFilteredSelectedRowModel().rows;
  const { syncCustomers, syncing } = useCheckCustomer();

  const handleSync = async () => {
    const selectedCustomers = selectedRows.map((row) => row.original);
    await syncCustomers(selectedCustomers);
    table.resetRowSelection();
  };

  return (
    <CommandBar open={selectedRows.length > 0}>
      <CommandBar.Bar>
        <CommandBar.Value>{selectedRows.length} {t('selected')}</CommandBar.Value>
        <Separator.Inline />
        <Button variant="secondary" onClick={handleSync} disabled={syncing}>
          {syncing ? t('syncing') : t('sync')}
        </Button>
      </CommandBar.Bar>
    </CommandBar>
  );
};
