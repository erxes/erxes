import { TemplateCategory } from '@/templates/types/TemplateCategory';
import { Row } from '@tanstack/table-core';
import { CommandBar, RecordTable, Separator } from 'erxes-ui';
import { TemplateCategoryDelete } from '../commands/TemplateCategoryDelete';

export const TemplateCategoryCommandBar = () => {
  const { table } = RecordTable.useRecordTable();

  const selectedRows = table.getFilteredSelectedRowModel().rows;
  const templateCategoryIds = selectedRows.map((row: Row<TemplateCategory>) => row.original._id);

  return (
    <CommandBar open={selectedRows.length > 0}>
      <CommandBar.Bar>
        <CommandBar.Value>{selectedRows.length} selected</CommandBar.Value>
        <Separator.Inline />
        <TemplateCategoryDelete templateCategoryIds={templateCategoryIds} rows={selectedRows} />
      </CommandBar.Bar>
    </CommandBar>
  );
};
