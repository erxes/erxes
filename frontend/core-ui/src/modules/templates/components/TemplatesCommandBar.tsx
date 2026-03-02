import { Row } from '@tanstack/table-core';
import { CommandBar, RecordTable, Separator } from 'erxes-ui';
import { BroadcastDelete } from './commands/TemplateDelete';

export const TemplatesCommandBar = () => {
  const { table } = RecordTable.useRecordTable();

  const selectedRows = table.getFilteredSelectedRowModel().rows;
  const templateIds = selectedRows.map((row: Row<any>) => row.original._id);

  return (
    <CommandBar open={selectedRows.length > 0}>
      <CommandBar.Bar>
        <CommandBar.Value>{selectedRows.length} selected</CommandBar.Value>
        <Separator.Inline />
        <BroadcastDelete templateIds={templateIds} rows={selectedRows} />
      </CommandBar.Bar>
    </CommandBar>
  );
};
