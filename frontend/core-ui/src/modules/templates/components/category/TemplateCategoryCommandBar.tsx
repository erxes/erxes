import { TemplateCategory } from '@/templates/types/TemplateCategory';
import { Row } from '@tanstack/table-core';
import { CommandBar, RecordTable, Separator } from 'erxes-ui';
import { TemplateCategoryDelete } from '../commands/TemplateCategoryDelete';
import { useTranslation } from 'react-i18next';

export const TemplateCategoryCommandBar = () => {
  const { t } = useTranslation('templates', { keyPrefix: 'template-category' });
  const { table } = RecordTable.useRecordTable();

  const selectedRows = table.getFilteredSelectedRowModel().rows;
  const templateCategoryIds = selectedRows.map(
    (row: Row<TemplateCategory>) => row.original._id,
  );

  return (
    <CommandBar open={selectedRows.length > 0}>
      <CommandBar.Bar>
        <CommandBar.Value>
          {t('selected', { count: selectedRows.length })}
        </CommandBar.Value>
        <Separator.Inline />
        <TemplateCategoryDelete
          templateCategoryIds={templateCategoryIds}
          rows={selectedRows}
        />
      </CommandBar.Bar>
    </CommandBar>
  );
};
