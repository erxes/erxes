import { Row } from '@tanstack/table-core';
import { CommandBar, RecordTable, Separator } from 'erxes-ui';
import { TicketDelete } from './delete/TicketDelete';

export const TicketCommandBar = () => {
  const { table } = RecordTable.useRecordTable();

  const selectedRows = table.getFilteredSelectedRowModel().rows;
  const ticketIds = selectedRows.map((row: Row<any>) => row.original._id);

  return (
    <CommandBar open={selectedRows.length > 0}>
      <CommandBar.Bar>
        <CommandBar.Value>{selectedRows.length} selected</CommandBar.Value>
        <Separator.Inline />
        <TicketDelete ticketIds={ticketIds} rows={selectedRows} />
      </CommandBar.Bar>
    </CommandBar>
  );
};
