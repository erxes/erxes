import { useGetPipeline } from '@/pipelines/hooks/useGetPipeline';
import { useTicketPermissions } from '@/ticket/hooks/useTicketPermissions';
import { ITicket } from '@/ticket/types';
import { IconRepeat } from '@tabler/icons-react';
import { Row } from '@tanstack/table-core';
import {
  Button,
  Command,
  CommandBar,
  Popover,
  RecordTable,
  Separator,
  useQueryState,
} from 'erxes-ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Can, Export } from 'ui-modules';
import { TicketsArchive } from './TicketsArchive';
import {
  TicketsAssignedMembersContent,
  TicketsAssignedMembersTrigger,
} from './TicketsAssignedMembers';
import {
  TicketsAssignToContent,
  TicketsAssignToTrigger,
} from './TicketsAssignTo';
import { TicketsDelete } from './TicketsDelete';
import {
  TicketsEditPriorityContent,
  TicketsEditPriorityTrigger,
} from './TicketsEditPriority';
import {
  TicketsEditStatusContent,
  TicketsEditStatusTrigger,
} from './TicketsEditStatus';
import {
  TicketsEditTagsContent,
  TicketsEditTagsTrigger,
} from './TicketsEditTags';
import {
  TicketsMoveToPipelineContent,
  TicketsMoveToPipelineTrigger,
} from './TicketsMoveToPipeline';

const getSharedValues = (valueLists: (string[] | undefined)[]): string[] => {
  if (valueLists.length === 0) return [];
  return valueLists.reduce<string[]>(
    (shared, list) => shared.filter((value) => (list || []).includes(value)),
    [...(valueLists[0] || [])],
  );
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
  const selectedPipelineIds = [
    ...new Set(selectedTickets.map((ticket) => ticket.pipelineId)),
  ];
  const pipelineId =
    pipelineIdParam ||
    (selectedPipelineIds.length === 1 ? selectedPipelineIds[0] : undefined);

  const selectedChannelIds = [
    ...new Set(selectedTickets.map((ticket) => ticket.channelId)),
  ];
  const channelId =
    selectedChannelIds.length === 1 ? selectedChannelIds[0] : undefined;

  const { pipeline } = useGetPipeline(pipelineId || undefined);
  const { canDeleteTicket, canEditTicket, canMoveTicket } =
    useTicketPermissions({ pipeline });

  const sharedAssignedMembers = getSharedValues(
    selectedTickets.map((ticket) => ticket.assignedMembers),
  );
  const sharedTagIds = getSharedValues(
    selectedTickets.map((ticket) => ticket.tagIds),
  );
  const allArchived =
    selectedTickets.length > 0 &&
    selectedTickets.every((ticket) => ticket.state === 'archived');

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
        {(canEditTicket || canMoveTicket || canDeleteTicket) && (
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
                {currentContent === 'main' && (
                  <Command>
                    <Command.Input />
                    <Command.List className="p-0">
                      {canEditTicket && (
                        <Command.Group className="p-1">
                          <TicketsAssignToTrigger
                            setCurrentContent={setCurrentContent}
                          />
                          <TicketsAssignedMembersTrigger
                            setCurrentContent={setCurrentContent}
                          />
                          <TicketsEditPriorityTrigger
                            setCurrentContent={setCurrentContent}
                          />
                          <TicketsEditTagsTrigger
                            setCurrentContent={setCurrentContent}
                          />
                        </Command.Group>
                      )}
                      {canMoveTicket && (pipelineId || channelId) && (
                        <Command.Group className="p-1">
                          {pipelineId && (
                            <TicketsEditStatusTrigger
                              setCurrentContent={setCurrentContent}
                            />
                          )}
                          {channelId && (
                            <TicketsMoveToPipelineTrigger
                              setCurrentContent={setCurrentContent}
                            />
                          )}
                        </Command.Group>
                      )}
                      <Command.Separator />
                      <Command.Group className="p-1">
                        {canEditTicket && (
                          <TicketsArchive
                            ticketIds={ticketIds}
                            archived={allArchived}
                            setOpen={setOpen}
                          />
                        )}
                        {canDeleteTicket && (
                          <TicketsDelete
                            ticketIds={ticketIds}
                            rows={selectedRows}
                            setOpen={setOpen}
                          />
                        )}
                      </Command.Group>
                    </Command.List>
                  </Command>
                )}
                {currentContent === 'assignee' && (
                  <TicketsAssignToContent
                    ticketIds={ticketIds}
                    setOpen={setOpen}
                  />
                )}
                {currentContent === 'assignedMembers' && (
                  <TicketsAssignedMembersContent
                    ticketIds={ticketIds}
                    assignedMembers={sharedAssignedMembers}
                  />
                )}
                {currentContent === 'status' && pipelineId && (
                  <TicketsEditStatusContent
                    ticketIds={ticketIds}
                    pipelineId={pipelineId}
                    setOpen={setOpen}
                  />
                )}
                {currentContent === 'priority' && (
                  <TicketsEditPriorityContent
                    ticketIds={ticketIds}
                    setOpen={setOpen}
                  />
                )}
                {currentContent === 'tags' && (
                  <TicketsEditTagsContent
                    ticketIds={ticketIds}
                    tagIds={sharedTagIds}
                  />
                )}
                {currentContent === 'pipeline' && channelId && (
                  <TicketsMoveToPipelineContent
                    ticketIds={ticketIds}
                    channelId={channelId}
                    pipelineId={pipelineId}
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
