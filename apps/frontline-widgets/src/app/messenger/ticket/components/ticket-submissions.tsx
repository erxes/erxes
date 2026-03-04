import {
  IconPlus,
  IconCircleMinus,
  IconChevronUp,
  IconCalendarTime,
  IconCalendarPlus,
  IconUserCancel,
} from '@tabler/icons-react';
import {
  Button,
  toast,
  Collapsible,
  Tooltip,
  Avatar,
  readImage,
  Separator,
} from 'erxes-ui';
import { useState } from 'react';
import {
  ITicketCheckProgress,
} from '../types';
import { format } from 'date-fns';
import { useGetTicketsByCustomer } from '../hooks/useGetTicketsByCustomer';
import { TicketStatusInlineValue } from './ticket-check-progress';
import { IUser } from '../../types';

export const TicketSubmissions = ({
  setPage,
}: {
  setPage: (page: 'submissions' | 'submit') => void;
}) => {
  const { tickets, error } = useGetTicketsByCustomer();

  if (error || tickets?.length === 0) {
    return (
      <div className="w-full h-full flex flex-col gap-3 p-3">
        <div className="flex flex-col gap-2 flex-1 w-full h-full overflow-y-auto styled-scroll">
          <div className="flex-1 flex flex-col items-center justify-center gap-1">
            <IconCircleMinus size={64} className="text-scroll" stroke={1} />
            <div className="text-lg font-medium mt-5 text-muted-foreground">
              No tickets found
            </div>
            <div className="text-accent-foreground mt-2 text-xs">
              Please create a ticket to get started.
            </div>
            <Button
              type="button"
              className="bg-primary flex-none shadow-2xs my-2"
              onClick={() => setPage('submit')}
            >
              <IconPlus size={16} />
              Issue new ticket
            </Button>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="w-full h-full flex flex-col gap-3 p-3">
      <div className="flex flex-col gap-2 flex-1 w-full h-full overflow-y-auto styled-scroll">
        {tickets?.map((ticket: ITicketCheckProgress) => (
          <TicketSubmissionItem key={ticket._id} ticket={ticket} />
        ))}
      </div>
      <div className="shrink-0">
        <Button
          type="button"
          className="bg-primary flex-none shadow-2xs my-2 w-full"
          onClick={() => setPage('submit')}
        >
          <IconPlus size={16} />
          Issue new ticket
        </Button>
      </div>
    </div>
  );
};

export const TicketSubmissionItem = ({
  ticket,
}: {
  ticket: ITicketCheckProgress;
}) => {
  const [open, setOpen] = useState(false);
  if (!ticket) return null;
  return (
    <Collapsible
      key={ticket._id}
      className="bg-background rounded-lg shadow-2xs"
      open={open}
      onOpenChange={setOpen}
    >
      <Collapsible.Trigger className="flex flex-row px-1.5 py-0 h-9 gap-2 items-center w-full cursor-pointer justify-between">
        <TicketStatusInlineValue status={ticket.status} />
        <div className="text-base font-semibold flex-1 shrink-0 truncate flex m-0 justify-between">
          {ticket.name || 'Untitled ticket'}
          {!open && <TicketDateDisplay value={ticket?.createdAt || undefined} />}
        </div>
        <div className="flex-none shrink-0">
          {open ? (
            <IconChevronUp className="size-4" />
          ) : (
            <TicketAssignee
              assignee={ticket.assignee}
              assigneeId={ticket.assigneeId}
            />
          )}
        </div>
      </Collapsible.Trigger>
      <Collapsible.Content className="p-0">
        <Separator />
        <div className="flex flex-col gap-2 p-3">
          <div className="flex gap-2 justify-between">
            <TicketDateDisplay
              value={ticket.startDate}
              placeholder="Start date"
            />
            <TicketDateDisplay
              value={ticket.targetDate}
              placeholder="Close date"
            />
          </div>
          <div className='flex justify-between items-center'>
            <div className="text-sm text-muted-foreground px-1">
              {parseTicketDescription(ticket.description)}
            </div>
            <div className="flex-none truncate text-left uppercase flex items-center">
              <span className="text-base text-muted-foreground">Ticket #</span>
              <span
                className="text-base text-muted-foreground hover:underline cursor-pointer hover:text-primary"
                onClick={() => {
                  navigator.clipboard.writeText(ticket.number);
                  toast({
                    title: 'Ticket number copied to clipboard',
                    variant: 'success',
                  });
                }}
              >
                {ticket.number}
              </span>
            </div>
          </div>
          <div>
            <TicketStatusInlineValue status={ticket.status} hasName />
          </div>
        </div>
        <Separator />
        <div className="flex flex-row py-0 px-2.5 h-9 items-center gap-2 w-full cursor-pointer justify-between">
          <span className="flex items-center gap-1">
            <p className="text-xs text-muted-foreground">Created at:</p>
            <TicketDateDisplay value={ticket?.createdAt || undefined} />
          </span>
          <div>
            <TicketAssignee
              assignee={ticket.assignee}
              assigneeId={ticket.assigneeId}
            />
          </div>
        </div>
      </Collapsible.Content>
    </Collapsible>
  );
};

export const TicketAssignee = ({
  assignee,
  assigneeId,
}: {
  assignee: IUser;
  assigneeId?: string;
}) => {
  if (!assigneeId && !assignee)
    return <IconUserCancel className="size-4 text-muted-foreground" />;
  return (
    <Tooltip.Provider>
      <Tooltip>
        <Tooltip.Trigger asChild>
          <Avatar>
            <Avatar.Image
              src={readImage(assignee.details?.avatar as string, 200)}
              alt={assignee.details?.fullName as string}
            />
            <Avatar.Fallback>
              {assignee.details?.fullName?.charAt(0) || ''}
            </Avatar.Fallback>
          </Avatar>
        </Tooltip.Trigger>
        <Tooltip.Content>
          <p>{assignee.details?.fullName}</p>
        </Tooltip.Content>
      </Tooltip>
    </Tooltip.Provider>
  );
};

export function parseTicketDescription(description: string) {
  try {
    const parsed = JSON.parse(description);
    return parsed?.[0]?.content?.[0]?.text || '';
  } catch {
    return description || '';
  }
}

export const TicketDateDisplay = ({
  value,
  placeholder = 'Not specified',
}: {
  value?: Date | string;
  placeholder?: string;
}) => {
  if (!value) {
    return (
      <div className="flex m-0 items-center gap-2 text-muted-foreground px-1">
        <IconCalendarPlus className="size-4" />
        <span className="text-xs font-medium">{placeholder}</span>
      </div>
    );
  }

  const date = typeof value === 'string' ? new Date(value) : value;

  return (
    <div className="flex items-center gap-2">
      <IconCalendarTime className="size-4 text-muted-foreground" />
      <span className="text-xs font-medium">
        {format(
          date,
          date.getFullYear() === new Date().getFullYear()
            ? 'MMM d, yyyy'
            : 'MMM d',
        )}
      </span>
    </div>
  );
};
