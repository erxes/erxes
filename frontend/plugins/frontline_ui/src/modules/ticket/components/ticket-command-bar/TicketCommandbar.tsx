import { Row } from '@tanstack/table-core';
import { CommandBar, RecordTable, Separator, useQueryState } from 'erxes-ui';
import { TicketDelete } from './delete/TicketDelete';
import { Export } from 'ui-modules/modules/import-export/components/epxort/Export';
import { useGetPipeline } from '@/pipelines/hooks/useGetPipeline';
import { useTicketPermissions } from '@/ticket/hooks/useTicketPermissions';

export const TicketCommandBar = () => {
  const { table } = RecordTable.useRecordTable();

  const selectedRows = table.getFilteredSelectedRowModel().rows;
  const ticketIds = selectedRows.map((row: Row<any>) => row.original._id);

  const [pipelineId] = useQueryState<string | null>('pipelineId');
  const { pipeline } = useGetPipeline(pipelineId || undefined);
  const { canDeleteTicket } = useTicketPermissions({ pipeline });

  return (
    <CommandBar open={selectedRows.length > 0}>
      <CommandBar.Bar>
        <CommandBar.Value>{selectedRows.length} selected</CommandBar.Value>
        <Separator.Inline />
        <Export
          pluginName="frontline"
          moduleName="ticket"
          collectionName="ticket"
          buttonVariant="secondary"
          ids={ticketIds}
        />
        {canDeleteTicket && (
          <TicketDelete ticketIds={ticketIds} rows={selectedRows} />
        )}
      </CommandBar.Bar>
    </CommandBar>
  );
};
