import { TemplateDelete } from '@/templates/components/commands/TemplateDelete';
import { Row } from '@tanstack/table-core';
import { CommandBar, RecordTable, Separator } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

export const TemplatesCommandBar = () => {
  const { t } = useTranslation('templates', { keyPrefix: 'template' });
  const { table } = RecordTable.useRecordTable();

  const selectedRows = table.getFilteredSelectedRowModel().rows;
  const templateIds = selectedRows.map((row: Row<any>) => row.original._id);

  return (
    <CommandBar open={selectedRows.length > 0}>
      <CommandBar.Bar>
        <CommandBar.Value>
          {t('selected', { count: selectedRows.length })}
        </CommandBar.Value>
        <Separator.Inline />
        <TemplateDelete templateIds={templateIds} rows={selectedRows} />
      </CommandBar.Bar>
    </CommandBar>
  );
};
