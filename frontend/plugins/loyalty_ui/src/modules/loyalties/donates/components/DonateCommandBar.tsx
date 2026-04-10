import { Row } from '@tanstack/table-core';
import { CommandBar, RecordTable, Separator } from 'erxes-ui';
import { IDonate } from '../types/donate';
import { DonateRemove } from './delete/DonateRemove';

export const DonateCommandBar = () => {
  const { table } = RecordTable.useRecordTable();

  const selectedRows = table.getFilteredSelectedRowModel()
    .rows as Row<IDonate>[];
  const donateIds = selectedRows.map((row) => row.original._id);

  return (
    <CommandBar open={selectedRows.length > 0}>
      <CommandBar.Bar>
        <CommandBar.Value>{selectedRows.length} selected</CommandBar.Value>
        <Separator.Inline />
        <DonateRemove donateIds={donateIds} rows={selectedRows} />
      </CommandBar.Bar>
    </CommandBar>
  );
};
