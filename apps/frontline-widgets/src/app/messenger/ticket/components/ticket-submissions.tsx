import {
  IconPlus,
  IconCircleMinus,
  IconCalendarTime,
  IconCalendarPlus,
  IconUserCancel,
  IconChevronDown,
} from '@tabler/icons-react';
import {
  Button,
  toast,
  Collapsible,
  Tooltip,
  Avatar,
  readImage,
  Separator,
  cn,
  Skeleton,
  BlockEditorReadOnly,
  formatDateISOStringToRelativeDate,
  ScrollArea,
} from 'erxes-ui';
import { AnimatePresence, motion } from 'motion/react';
import { ComponentPropsWithoutRef, FC, useMemo, useState } from 'react';
import { ITicketCheckProgress, ITicketNote } from '../types';
import { format } from 'date-fns';
import { useGetTicketsByCustomer } from '../hooks/useGetTicketsByCustomer';
import { IUser } from '../../types';
import { useSetAtom } from 'jotai';
import { ticketTabAtom } from '../../states';
import { useGetTicketNotes } from '../hooks/useGetTicketNotes';
import { WdigetMembersInline } from '../../components/widget-members-inline';
import { TicketStatusInlineValue } from './ticket-status-inline';

export const TicketSubmissions = () => {
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
            <NewTicket />
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="w-full h-full flex flex-col gap-3 p-3">
      <div className="flex-1 min-h-0">
        <ScrollArea className="h-full">
          <div className="flex flex-col gap-2 w-full">
            {tickets?.map((ticket: ITicketCheckProgress) => (
              <TicketSubmissionItem key={ticket._id} ticket={ticket} />
            ))}
          </div>
        </ScrollArea>
      </div>
      <div className="shrink-0">
        <NewTicket
          variant={'secondary'}
          className="bg-primary hover:bg-primary/70 text-primary-foreground flex-none shadow-2xs my-2 w-full"
        />
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
      className="bg-background rounded-lg shadow-2xs text-foreground"
      open={open}
      onOpenChange={setOpen}
    >
      <Collapsible.Trigger className="flex flex-row px-1.5 py-0 h-9 gap-2 items-center w-full cursor-pointer justify-between">
        <TicketStatusInlineValue.Icon status={ticket.status} />
        <div className="text-base font-semibold flex-1 inline-flex items-center shrink-0 truncate m-0">
          {ticket.name || 'Untitled ticket'}
          <AnimatePresence mode="popLayout">
            {open && (
              <motion.span
                key={'ticket-number'}
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 'auto', opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
                className="inline-flex items-center pl-1"
              >
                <TicketNumberDisplay ticket={ticket} />
              </motion.span>
            )}
          </AnimatePresence>
          <span className="ml-auto">
            <TicketStatusInlineValue.Status status={ticket.status} />
          </span>
        </div>
        <Collapsible.TriggerButton className="flex-0">
          <IconChevronDown
            size={16}
            className={cn(
              { 'rotate-180': open },
              'transition-all ease-in-out duration-200',
            )}
          />
        </Collapsible.TriggerButton>
      </Collapsible.Trigger>
      {!open && (
        <div className="inline-flex gap-1 items-center p-3">
          <span className="inline-flex items-center gap-0.5 text-sm">
            <span className="text-muted-foreground">Due</span>
            <TicketDateDisplay
              value={ticket.targetDate}
              placeholder="Not specified"
              displayFullYear
            />
          </span>
          <span>·</span>
          <TicketNumberDisplay ticket={ticket} prefix="ticket" />
        </div>
      )}
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
          <div className="flex justify-start items-center">
            <div className="text-sm text-muted-foreground px-1">
              {parseTicketDescription(ticket.description)}
            </div>
          </div>

          <TicketNotes _id={ticket._id} />
        </div>
        <Separator />
      </Collapsible.Content>

      <div className="flex flex-row py-0 px-2.5 h-9 items-center gap-2 w-full cursor-pointer justify-between">
        <span className="flex items-center gap-1">
          <TicketDateDisplay
            value={ticket?.createdAt || undefined}
            displayFullYear
            displayTime
          />
        </span>
        <div>
          <TicketAssignee
            assignee={ticket.assignee}
            assigneeId={ticket.assigneeId}
          />
        </div>
      </div>
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
  displayFullYear = false,
  displayTime = false,
}: {
  value?: Date | string;
  placeholder?: string;
  displayFullYear?: boolean;
  displayTime?: boolean;
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

  const showYear =
    date.getFullYear() !== new Date().getFullYear() || displayFullYear;

  const dateFormat = showYear ? 'MMM d, yyyy' : 'MMM d';
  const formatString = displayTime ? `${dateFormat} HH:mm` : dateFormat;

  return (
    <div className="flex items-center gap-2">
      <IconCalendarTime className="size-4 text-muted-foreground" />
      <span className="text-xs font-medium">{format(date, formatString)}</span>
    </div>
  );
};

export const NewTicket: FC<ComponentPropsWithoutRef<typeof Button>> = ({
  variant,
  className,
  ...rest
}) => {
  const setPage = useSetAtom(ticketTabAtom);
  return (
    <Button
      type="button"
      variant={variant}
      className={cn('bg-primary flex-none shadow-2xs my-2', className)}
      onClick={() => setPage('selection')}
      {...rest}
    >
      <IconPlus size={16} />
      Issue a new ticket
    </Button>
  );
};

export const TicketNotes = ({ _id: contentId }: { _id: string }) => {
  const [showAll, setShowAll] = useState(false);
  const { notes, error, loading } = useGetTicketNotes({
    variables: {
      contentId,
    },
    skip: !contentId,
  });

  const sortedNotes = useMemo(
    () =>
      [...notes].sort(
        (a, b) => Number(b.createdAt || 0) - Number(a.createdAt || 0),
      ),
    [notes],
  );

  if (loading) {
    return <Skeleton className="h-7 w-full" />;
  }

  if (error || sortedNotes.length === 0) {
    return null;
  }

  const [latestNote, ...earlierNotes] = sortedNotes;
  const earlierCount = earlierNotes.length;
  const noteLabel = `note${earlierCount > 1 ? 's' : ''}`;

  return (
    <>
      <Separator />
      <h4 className="font-mono uppercase text-sm text-accent-foreground">
        Activity
      </h4>
      <div className="ml-2.5 relative before:absolute before:left-1.5 before:top-1 before:bottom-1 before:w-px before:bg-muted flex flex-col">
        <TicketNoteItem note={latestNote} />
        <AnimatePresence initial={false}>
          {showAll && (
            <motion.div
              key="earlier-notes"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
              className="overflow-hidden"
            >
              <div className="flex flex-col gap-6 pt-6">
                {earlierNotes.map((note) => (
                  <TicketNoteItem key={note._id} note={note} />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      {earlierCount > 0 && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="self-start text-xs text-muted-foreground"
          onClick={() => setShowAll((prev) => !prev)}
        >
          <motion.span
            className="inline-flex"
            animate={{ rotate: showAll ? 180 : 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
          >
            <IconChevronDown size={14} />
          </motion.span>
          {showAll
            ? `Hide ${earlierCount} ${noteLabel}`
            : `Show ${earlierCount} earlier ${noteLabel}`}
        </Button>
      )}
    </>
  );
};

export const TicketNoteItem = ({ note }: { note: ITicketNote }) => {
  const memberIds = note.createdBy ? [note.createdBy] : [];
  const isSystem = note.createdBy === 'system';

  return (
    <div className="inline-flex gap-1">
      <WdigetMembersInline memberIds={memberIds}>
        {isSystem ? (
          <Avatar>
            <Avatar.Fallback>S</Avatar.Fallback>
          </Avatar>
        ) : (
          <WdigetMembersInline.Avatar />
        )}
        <div className="flex flex-1 flex-col">
          <span className="text-xs inline-flex gap-1">
            {isSystem ? (
              <span className="font-bold">System</span>
            ) : (
              <WdigetMembersInline.Title className="font-bold" />
            )}
            <p>left a note</p>
            <p className="text-muted-foreground">
              {formatDateISOStringToRelativeDate(
                new Date(Number(note.createdAt)).toISOString(),
              )}
            </p>
          </span>
          <div className="border rounded-lg min-h-14 px-4 py-3 ml-1 mt-1">
            <BlockEditorReadOnly
              content={note.content || ''}
              className="read-only text-sm"
            />
          </div>
        </div>
      </WdigetMembersInline>
    </div>
  );
};

export const TicketNumberDisplay = ({
  ticket,
  prefix,
}: {
  ticket: ITicketCheckProgress;
  prefix?: string;
}) => {
  return (
    <div className="flex-none truncate capitalize flex items-center">
      <span className="text-sm text-muted-foreground">
        {prefix ? prefix + '#' : '#'}
      </span>
      <span
        className="text-sm text-muted-foreground hover:underline cursor-pointer hover:text-primary"
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
  );
};
