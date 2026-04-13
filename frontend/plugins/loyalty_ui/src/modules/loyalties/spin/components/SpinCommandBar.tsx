import { Row } from '@tanstack/table-core';
import { CommandBar, RecordTable, Separator } from 'erxes-ui';
import { ISpin } from '@/loyalties/spin/types/spin';
import { SpinRemove } from './delete/SpinRemove';

export const SpinCommandBar = () => {
  const { table } = RecordTable.useRecordTable();

  const selectedRows = table.getFilteredSelectedRowModel().rows as Row<ISpin>[];
  const spinIds = selectedRows.map((row) => row.original._id);

  return (
    <CommandBar open={selectedRows.length > 0}>
      <CommandBar.Bar>
        <CommandBar.Value>{selectedRows.length} selected</CommandBar.Value>
        <Separator.Inline />
        <SpinRemove spinIds={spinIds} rows={selectedRows} />
      </CommandBar.Bar>
    </CommandBar>
  );
};
