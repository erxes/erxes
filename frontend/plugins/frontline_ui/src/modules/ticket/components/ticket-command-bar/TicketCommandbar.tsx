import { useGetPipeline } from '@/pipelines/hooks/useGetPipeline';
import { useTicketPermissions } from '@/ticket/hooks/useTicketPermissions';
import { ITicket } from '@/ticket/types';
import { IconRepeat } from '@tabler/icons-react';
import { Row } from '@tanstack/table-core';
import {
  Button,
  CommandBar,
  Popover,
  RecordTable,
  Separator,
  useQueryState,
} from 'erxes-ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Can, Export } from 'ui-modules';
import { TicketActionsMenu, TicketActionsPanel } from './TicketActions';

/** Ids every selected ticket has in common, so bulk edits start from a shared value. */
const getSharedValues = (valueLists: (string[] | undefined)[]): string[] => {
  if (valueLists.length === 0) return [];
  return valueLists.reduce<string[]>(
    (shared, list) => shared.filter((value) => (list || []).includes(value)),
    [...(valueLists[0] || [])],
  );
};

/** The single value every selected ticket carries, or undefined when they disagree. */
const getSharedValue = (values: (string | undefined)[]): string | undefined => {
  const unique = [...new Set(values)];
  return unique.length === 1 ? unique[0] : undefined;
};

export const TicketCommandBar = () => {
  const { t } = useTranslation('frontline');
  const { table } = RecordTable.useRecordTable();

  const [open, setOpen] = useState(false);
  const [currentContent, setCurrentContent] = useState('main');

  const selectedRows = table.getFilteredSelectedRowModel()
    .rows as Row<ITicket>[];
  const selectedTickets = selectedRows.map((row) => row.original);
  const ticketIds = selectedTickets.map((ticket) => ticket._id);

  const [pipelineIdParam] = useQueryState<string | null>('pipelineId');

  // Prefer the selection's own pipeline so a status change can never target a
  // pipeline the selected tickets do not belong to.
  const sharedPipelineId = getSharedValue(
    selectedTickets.map((ticket) => ticket.pipelineId),
  );
  const pipelineId =
    sharedPipelineId ||
    (selectedTickets.length === 0 ? pipelineIdParam || undefined : undefined);

  const channelId = getSharedValue(
    selectedTickets.map((ticket) => ticket.channelId),
  );

  const { pipeline } = useGetPipeline(pipelineId || undefined);
  const { canDeleteTicket, canEditTicket, canMoveTicket } =
    useTicketPermissions({ pipeline });

  const sharedAssignedMembers = getSharedValues(
    selectedTickets.map((ticket) => ticket.assignedMembers),
  );
  const sharedTagIds = getSharedValues(
    selectedTickets.map((ticket) => ticket.tagIds),
  );
  const sharedAssigneeIds = getSharedValues(
    selectedTickets.map((ticket) => ticket.assigneeIds),
  );
  const allArchived =
    selectedTickets.length > 0 &&
    selectedTickets.every((ticket) => ticket.state === 'archived');

  const hasAnyAction = canEditTicket || canMoveTicket || canDeleteTicket;

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (!nextOpen) {
      setTimeout(() => setCurrentContent('main'), 100);
    }
  };

  return (
    <CommandBar open={selectedRows.length > 0}>
      <CommandBar.Bar>
        <CommandBar.Value>{selectedRows.length} selected</CommandBar.Value>
        <Can action="ticketsExportManage">
          <Separator.Inline />
          <Export
            pluginName="frontline"
            moduleName="ticket"
            collectionName="ticket"
            buttonVariant="secondary"
            ids={ticketIds}
          />
        </Can>
        {hasAnyAction && (
          <>
            <Separator.Inline />
            <Popover open={open} onOpenChange={handleOpenChange}>
              <Popover.Trigger asChild>
                <Button variant="secondary">
                  <IconRepeat />
                  {t('actions')}
                </Button>
              </Popover.Trigger>
              <Popover.Content
                className="min-w-[280px] p-0"
                align="end"
                side="top"
                sideOffset={10}
              >
                {currentContent === 'main' ? (
                  <TicketActionsMenu
                    ticketIds={ticketIds}
                    rows={selectedRows}
                    pipelineId={pipelineId}
                    channelId={channelId}
                    allArchived={allArchived}
                    permissions={{
                      canEditTicket,
                      canMoveTicket,
                      canDeleteTicket,
                    }}
                    setCurrentContent={setCurrentContent}
                    setOpen={setOpen}
                  />
                ) : (
                  <TicketActionsPanel
                    currentContent={currentContent}
                    ticketIds={ticketIds}
                    pipelineId={pipelineId}
                    channelId={channelId}
                    sharedAssignedMembers={sharedAssignedMembers}
                    sharedTagIds={sharedTagIds}
                    sharedAssigneeIds={sharedAssigneeIds}
                    setOpen={setOpen}
                  />
                )}
              </Popover.Content>
            </Popover>
          </>
        )}
      </CommandBar.Bar>
    </CommandBar>
  );
};
