import { Row } from '@tanstack/table-core';
import { CommandBar, RecordTable, Separator } from 'erxes-ui';
import { FormDelete } from './delete/form-delete';
import { FormStatusToggle } from './status/form-status-toggle';
import { useTranslation } from 'react-i18next';

export const FormCommandBar = () => {
  const { t } = useTranslation('frontline');
  const { table } = RecordTable.useRecordTable();

  const selectedRows = table.getFilteredSelectedRowModel().rows;
  const formIds = selectedRows.map((row: Row<any>) => row.original._id);

  return (
    <CommandBar open={selectedRows.length > 0}>
      <CommandBar.Bar>
        <CommandBar.Value>{t('n-selected', { count: selectedRows.length })}</CommandBar.Value>
        <Separator.Inline />
        <FormDelete formIds={formIds} rows={selectedRows} />
        <FormStatusToggle formIds={formIds} rows={selectedRows} />
      </CommandBar.Bar>
    </CommandBar>
  );
};
