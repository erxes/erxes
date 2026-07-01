import { Row } from '@tanstack/table-core';
import { CommandBar, RecordTable, Separator } from 'erxes-ui';
import { ClientPortalRemove } from './delete/ClientPortalRemove';
import { useTranslation } from 'react-i18next';

export const ClientPortalCommandBar = () => {
  const { t } = useTranslation('client-portal');
  const { table } = RecordTable.useRecordTable();

  const selectedRows = table.getFilteredSelectedRowModel().rows;
  const clientPortalIds = selectedRows.map((row: Row<any>) => row.original._id);

  const handleClose = () => table.resetRowSelection();
  return (
    <CommandBar open={selectedRows.length > 0}>
      <CommandBar.Bar>
        <CommandBar.Value onClose={handleClose}>
          {selectedRows.length} {t('selected', 'selected')}
        </CommandBar.Value>
        <Separator.Inline />
        <ClientPortalRemove
          clientPortalIds={clientPortalIds}
          rows={selectedRows}
        />
      </CommandBar.Bar>
    </CommandBar>
  );
};
