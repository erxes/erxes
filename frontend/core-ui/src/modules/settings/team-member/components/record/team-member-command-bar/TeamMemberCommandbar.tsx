import { Row } from '@tanstack/table-core';
import { CommandBar, RecordTable, Separator } from 'erxes-ui';
import { TeamMemberDelete } from './delete/TeamMemberDelete';

export const TeamMemberCommandBar = () => {
  const { table } = RecordTable.useRecordTable();

  const selectedRows = table.getFilteredSelectedRowModel().rows;
  const teamMemberIds = selectedRows.map((row: Row<any>) => row.original._id);

  return (
    <CommandBar open={selectedRows.length > 0}>
      <CommandBar.Bar>
        <CommandBar.Value>{selectedRows.length} selected</CommandBar.Value>
        <Separator.Inline />
        <TeamMemberDelete teamMemberIds={teamMemberIds} rows={selectedRows} />
      </CommandBar.Bar>
    </CommandBar>
  );
};
