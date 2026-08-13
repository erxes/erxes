import { ITicket } from '@/ticket/types';
import { Row } from '@tanstack/table-core';
import { Command } from 'erxes-ui';
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

export type TTicketPermissions = {
  canEditTicket: boolean;
  canMoveTicket: boolean;
  canDeleteTicket: boolean;
};

export type TTicketActionsProps = {
  ticketIds: string[];
  rows: Row<ITicket>[];
  pipelineId?: string;
  channelId?: string;
  sharedAssignedMembers: string[];
  sharedTagIds: string[];
  sharedAssigneeIds: string[];
  allArchived: boolean;
  permissions: TTicketPermissions;
  setCurrentContent: (currentContent: string) => void;
  setOpen: (open: boolean) => void;
};

export const TicketActionsMenu = ({
  ticketIds,
  rows,
  pipelineId,
  channelId,
  allArchived,
  permissions,
  setCurrentContent,
  setOpen,
}: Omit<
  TTicketActionsProps,
  'sharedAssignedMembers' | 'sharedTagIds' | 'sharedAssigneeIds'
>) => {
  const { canEditTicket, canMoveTicket, canDeleteTicket } = permissions;
  const showMoveGroup = canMoveTicket && (pipelineId || channelId);
  const showDestructiveGroup = canEditTicket || canDeleteTicket;

  return (
    <Command>
      <Command.Input />
      <Command.List className="p-0">
        {canEditTicket && (
          <Command.Group className="p-1">
            <TicketsAssignToTrigger setCurrentContent={setCurrentContent} />
            <TicketsAssignedMembersTrigger
              setCurrentContent={setCurrentContent}
            />
            <TicketsEditPriorityTrigger setCurrentContent={setCurrentContent} />
            <TicketsEditTagsTrigger setCurrentContent={setCurrentContent} />
          </Command.Group>
        )}
        {showMoveGroup && (
          <Command.Group className="p-1">
            {pipelineId && (
              <TicketsEditStatusTrigger setCurrentContent={setCurrentContent} />
            )}
            {channelId && (
              <TicketsMoveToPipelineTrigger
                setCurrentContent={setCurrentContent}
              />
            )}
          </Command.Group>
        )}
        {showDestructiveGroup && (
          <>
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
                  rows={rows}
                  setOpen={setOpen}
                />
              )}
            </Command.Group>
          </>
        )}
      </Command.List>
    </Command>
  );
};

export const TicketActionsPanel = ({
  currentContent,
  ticketIds,
  pipelineId,
  channelId,
  sharedAssignedMembers,
  sharedTagIds,
  sharedAssigneeIds,
  setOpen,
}: Pick<
  TTicketActionsProps,
  | 'ticketIds'
  | 'pipelineId'
  | 'channelId'
  | 'sharedAssignedMembers'
  | 'sharedTagIds'
  | 'sharedAssigneeIds'
  | 'setOpen'
> & { currentContent: string }) => {
  switch (currentContent) {
    case 'assignee':
      return (
        <TicketsAssignToContent
          ticketIds={ticketIds}
          assigneeIds={sharedAssigneeIds}
        />
      );
    case 'assignedMembers':
      return (
        <TicketsAssignedMembersContent
          ticketIds={ticketIds}
          assignedMembers={sharedAssignedMembers}
        />
      );
    case 'priority':
      return (
        <TicketsEditPriorityContent ticketIds={ticketIds} setOpen={setOpen} />
      );
    case 'tags':
      return (
        <TicketsEditTagsContent ticketIds={ticketIds} tagIds={sharedTagIds} />
      );
    case 'status':
      return pipelineId ? (
        <TicketsEditStatusContent
          ticketIds={ticketIds}
          pipelineId={pipelineId}
          setOpen={setOpen}
        />
      ) : null;
    case 'pipeline':
      return channelId ? (
        <TicketsMoveToPipelineContent
          ticketIds={ticketIds}
          channelId={channelId}
          pipelineId={pipelineId}
          setOpen={setOpen}
        />
      ) : null;
    default:
      return null;
  }
};
