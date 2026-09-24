'use client';

import { useMutation, useQuery } from '@apollo/client/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form } from 'erxes-ui/components/form';
import { toast } from 'erxes-ui/hooks/use-toast';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useSession } from '@/modules/auth/components/SessionProvider';
import { Avatar } from '@/modules/ui/components/Avatar';
import { BlockText } from '@/modules/ui/components/BlockText';
import { Button } from '@/modules/ui/components/Button';
import { Card } from '@/modules/ui/components/Card';
import { EmptyState } from '@/modules/ui/components/EmptyState';
import { TextareaInput } from '@/modules/ui/components/FormInput';
import { Icon } from '@/modules/ui/components/Icon';
import { LoadError } from '@/modules/ui/components/PortalState';
import { cn } from '@/modules/ui/lib/cn';
import { formatDateTime, splitTicketBody } from '../utils/format';
import { TICKET_PORTAL_ADD_NOTE } from '../graphql/mutations/tickets';
import {
  TICKET_PORTAL_DETAIL,
  TICKET_PORTAL_NOTES,
} from '../graphql/queries/tickets';
import type { Ticket, TicketNote } from '../types';
import { PriorityBadge, StatusBadge } from './TicketBadges';
import { plural } from '@/modules/ui/lib/plural';

type DetailResponse = { cpGetTicket: Ticket | null };
type NotesResponse = { cpTicketGetNotes: TicketNote[] | null };

const replySchema = z.object({
  content: z.string().refine((value) => value.trim().length >= 2, {
    message: 'Please write your reply.',
  }),
});

type ReplyValues = z.infer<typeof replySchema>;

const Skeleton = () => (
  <div className="grid animate-pulse items-start gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
    <Card className="space-y-3 p-6">
      <span className="block h-6 w-2/3 max-w-sm rounded bg-subtle" />
      <span className="block h-4 w-full rounded bg-subtle" />
      <span className="block h-4 w-2/3 rounded bg-subtle" />
    </Card>
    <Card className="space-y-3 p-5">
      <span className="block h-4 w-32 rounded bg-subtle" />
      <span className="block h-9 w-full rounded bg-subtle" />
    </Card>
  </div>
);

const TEAM_NAME = 'Support team';

const authorOf = (createdBy: string | null, reporter: string) =>
  createdBy?.startsWith('cp:')
    ? { name: reporter, team: false }
    : { name: TEAM_NAME, team: true };

const Message = ({
  author,
  team,
  at,
  body,
  origin,
}: {
  author: string;
  team: boolean;
  at: string | null;
  body: string;
  origin?: boolean;
}) => (
  <li className={cn('flex gap-3.5 px-5 py-5', team && 'bg-subtle/60')}>
    <Avatar
      name={author}
      size={34}
      className={cn('mt-0.5 shrink-0', team && 'bg-ink text-white')}
    />
    <div className="min-w-0 flex-1">
      <div className="flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
        <span className="text-sm font-semibold text-ink">{author}</span>
        {origin ? (
          <span className="text-[13px] text-muted-foreground">
            created this ticket
          </span>
        ) : null}
        <span className="ml-auto text-[13px] tabular-nums text-muted-foreground">
          {formatDateTime(at)}
        </span>
      </div>
      <BlockText
        content={body}
        className="mt-2 text-sm leading-relaxed text-ink-soft"
      />
    </div>
  </li>
);

const RailLabel = ({ children }: { children: string }) => (
  <h2 className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
    {children}
  </h2>
);

const CopyNumber = ({ number }: { number: string }) => (
  <button
    type="button"
    onClick={() => {
      navigator.clipboard
        .writeText(number)
        .then(() =>
          toast({
            variant: 'success',
            title: 'Copied',
            description: 'The ticket number was copied to your clipboard.',
          }),
        )
        .catch(() =>
          toast({
            variant: 'destructive',
            title: 'Could not copy',
            description: 'Please select and copy the number manually.',
          }),
        );
    }}
    className="group flex w-full items-center gap-2 rounded-lg bg-subtle px-3 py-2.5 text-left outline-none transition-colors duration-300 ease-out-soft hover:bg-brand-soft focus-visible:bg-brand-soft"
  >
    <span className="min-w-0 flex-1 truncate text-[15px] font-semibold tabular-nums text-ink">
      {number}
    </span>
    <Icon
      name="paste"
      size={15}
      className="shrink-0 text-muted-foreground transition-colors group-hover:text-brand"
    />
  </button>
);

export const TicketDetail = ({ ticketId }: { ticketId: string }) => {
  const { user } = useSession();

  const form = useForm<ReplyValues>({
    resolver: zodResolver(replySchema),
    defaultValues: { content: '' },
  });

  const { data, loading, error } = useQuery<DetailResponse>(
    TICKET_PORTAL_DETAIL,
    { variables: { _id: ticketId } },
  );

  const notes = useQuery<NotesResponse>(TICKET_PORTAL_NOTES, {
    variables: { ticketId },
  });

  const [addNote, { loading: sending, error: sendError }] = useMutation(
    TICKET_PORTAL_ADD_NOTE,
    {
      refetchQueries: [{ query: TICKET_PORTAL_NOTES, variables: { ticketId } }],
      awaitRefetchQueries: true,
    },
  );

  if (loading) {
    return <Skeleton />;
  }

  if (error) {
    return (
      <LoadError title="Could not load the ticket" message={error.message} />
    );
  }

  const ticket = data?.cpGetTicket;

  if (!ticket) {
    return (
      <EmptyState
        icon="ticket"
        title="Ticket not found"
        description="This ticket was deleted, or you do not have permission to view it."
      />
    );
  }

  const thread = notes.data?.cpTicketGetNotes ?? [];
  const { message, contact } = splitTicketBody(ticket.description);

  const contactLines = contact
    ? contact
        .split('·')
        .map((part) => part.trim())
        .filter(Boolean)
    : [user?.name, user?.email, user?.phone].filter((part): part is string =>
        Boolean(part),
      );

  const reporter = contactLines[0] ?? 'You';

  const onSubmit = async ({ content }: ReplyValues) => {
    const result = await addNote({
      variables: { contentId: ticketId, content: content.trim() },
    }).catch(() => null);

    if (result?.data) {
      form.reset({ content: '' });
      toast({
        variant: 'success',
        title: 'Sent',
        description: 'Your message was added to the ticket.',
      });
    }
  };

  const created = formatDateTime(ticket.createdAt);
  const updated = formatDateTime(ticket.updatedAt);
  const statusChanged = ticket.statusChangedDate
    ? formatDateTime(ticket.statusChangedDate)
    : null;

  const meta = [
    { label: 'Created', value: created },
    ...(updated !== created ? [{ label: 'Updated', value: updated }] : []),
    ...(statusChanged && statusChanged !== created
      ? [{ label: 'Status changed', value: statusChanged }]
      : []),
  ];

  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 fill-mode-both grid items-start gap-6 duration-500 lg:grid-cols-[minmax(0,1fr)_300px]">
      <div className="order-2 space-y-4 lg:order-1">
        <Card className="overflow-hidden">
          <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-3 border-b border-line px-5 py-5">
            <div className="min-w-0">
              <h2 className="text-[18px] font-semibold leading-snug tracking-[-0.01em] text-ink">
                {ticket.name ?? 'Untitled ticket'}
              </h2>
              <p className="mt-1 text-[12px] text-muted-foreground">
                {plural(thread.length + 1, 'message')}
              </p>
            </div>

            <div className="flex shrink-0 flex-wrap items-center gap-2">
              <StatusBadge status={ticket.status} />
              <PriorityBadge priority={ticket.priority} />
            </div>
          </div>

          <ol className="divide-y divide-line-soft">
            <Message
              author={reporter}
              team={false}
              at={ticket.createdAt}
              body={message || 'No description was provided.'}
              origin
            />

            {thread.map((note) => {
              const { name, team } = authorOf(note.createdBy, reporter);

              return (
                <Message
                  key={note._id}
                  author={name}
                  team={team}
                  at={note.createdAt}
                  body={note.content ?? ''}
                />
              );
            })}
          </ol>

          {notes.loading ? (
            <p className="border-t border-line-soft px-5 py-4 text-[13px] text-muted-foreground">
              Loading the conversation…
            </p>
          ) : notes.error ? (
            <div className="border-t border-line-soft p-5">
              <LoadError
                title="Could not load the conversation"
                message={notes.error.message}
              />
            </div>
          ) : null}
        </Card>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            noValidate
            className="overflow-hidden rounded-2xl bg-white shadow-shell"
          >
            <div className="p-5">
              <Form.Field
                control={form.control}
                name="content"
                render={({ field }) => (
                  <Form.Item>
                    <Form.Label
                      className="text-[13px] font-medium text-ink"
                      variant="peer"
                    >
                      Write a reply
                    </Form.Label>
                    <Form.Control>
                      <TextareaInput
                        {...field}
                        rows={3}
                        placeholder="Add more detail or ask a question"
                      />
                    </Form.Control>
                    <Form.Message />
                  </Form.Item>
                )}
              />

              {sendError ? (
                <p
                  role="alert"
                  className="mt-3 flex items-start gap-2 rounded-lg bg-danger-soft px-3.5 py-2.5 text-[13px] leading-relaxed text-danger"
                >
                  <Icon name="alert" size={15} className="mt-px shrink-0" />
                  {sendError.message}
                </p>
              ) : null}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line bg-subtle px-5 py-4">
              <p className="text-xs text-muted-foreground">
                The support team sees your message right away.
              </p>
              <Button type="submit" disabled={sending}>
                <Icon name="send" size={15} />
                {sending ? 'Sending…' : 'Send'}
              </Button>
            </div>
          </form>
        </Form>
      </div>

      <Card className="order-1 divide-y divide-line-soft lg:order-2 lg:sticky lg:top-6">
        <div className="p-5">
          <RailLabel>Ticket number</RailLabel>
          <p className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground">
            Use this to check progress without signing in.
          </p>
          <div className="mt-3">
            {ticket.number ? (
              <CopyNumber number={ticket.number} />
            ) : (
              <p className="text-sm text-muted-foreground">—</p>
            )}
          </div>
        </div>

        <div className="p-5">
          <RailLabel>Details</RailLabel>
          <dl className="mt-3 space-y-2.5">
            {meta.map((item) => (
              <div key={item.label}>
                <dt className="text-[12px] text-muted-foreground">
                  {item.label}
                </dt>
                <dd className="mt-0.5 break-words text-[13px] font-medium tabular-nums text-ink">
                  {item.value}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        {contactLines.length ? (
          <div className="p-5">
            <RailLabel>Contact</RailLabel>
            <ul className="mt-3 space-y-1">
              {contactLines.map((part) => (
                <li
                  key={part}
                  className="break-words text-[13px] leading-relaxed text-ink-soft"
                >
                  {part}
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </Card>
    </div>
  );
};
