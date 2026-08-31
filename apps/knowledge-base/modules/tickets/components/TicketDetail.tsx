'use client';

import { useMutation, useQuery } from '@apollo/client/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form } from 'erxes-ui/components/form';
import { toast } from 'erxes-ui/hooks/use-toast';
import Link from 'next/link';
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

type DetailResponse = { cpGetTicket: Ticket | null };
type NotesResponse = { cpTicketGetNotes: TicketNote[] | null };

const replySchema = z.object({
  content: z.string().refine((value) => value.trim().length >= 2, {
    message: 'Хариу мессежээ бичнэ үү.',
  }),
});

type ReplyValues = z.infer<typeof replySchema>;

/* Shaped like the page it stands in, so nothing jumps once the ticket lands. */
const Skeleton = () => (
  <div className="animate-pulse">
    <span className="block h-4 w-24 rounded bg-line" />
    <span className="mt-4 block h-7 w-2/3 max-w-sm rounded bg-line" />
    <span className="mt-3 block h-6 w-28 rounded-full bg-line" />

    <div className="mt-7 grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_290px]">
      <Card className="space-y-3 p-6">
        <span className="block h-4 w-40 rounded bg-subtle" />
        <span className="block h-4 w-full rounded bg-subtle" />
        <span className="block h-4 w-2/3 rounded bg-subtle" />
      </Card>
      <Card className="space-y-3 p-5">
        <span className="block h-4 w-32 rounded bg-subtle" />
        <span className="block h-9 w-full rounded bg-subtle" />
      </Card>
    </div>
  </div>
);

const TEAM_NAME = 'Дэмжлэгийн баг';

/**
 * The portal stamps its own notes `cp:<id>`; anything else on a ticket the
 * requester is looking at was written by staff. Either way the raw id never
 * reaches the page.
 */
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
            хүсэлтийг үүсгэсэн
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

const CopyNumber = ({ number }: { number: string }) => (
  <button
    type="button"
    onClick={() => {
      navigator.clipboard
        .writeText(number)
        .then(() =>
          toast({
            variant: 'success',
            title: 'Хуулагдлаа',
            description: 'Хүсэлтийн дугаарыг санах ойд хууллаа.',
          }),
        )
        .catch(() =>
          toast({
            variant: 'destructive',
            title: 'Хуулж чадсангүй',
            description: 'Дугаарыг гараар тэмдэглэн хуулна уу.',
          }),
        );
    }}
    className="group flex w-full items-center gap-2 rounded-lg bg-subtle px-3 py-2 text-left transition-colors hover:bg-brand-soft"
  >
    <span className="min-w-0 flex-1 truncate text-sm font-semibold tabular-nums text-ink">
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
      <LoadError title="Хүсэлтийг татаж чадсангүй" message={error.message} />
    );
  }

  const ticket = data?.cpGetTicket;

  if (!ticket) {
    return (
      <EmptyState
        icon="ticket"
        title="Хүсэлт олдсонгүй"
        description="Энэ хүсэлт устсан эсвэл та түүнийг үзэх эрхгүй байна."
      />
    );
  }

  const thread = notes.data?.cpTicketGetNotes ?? [];
  const { message, contact } = splitTicketBody(ticket.description);

  /*
   * Older tickets carry the contact line in the body; newer ones keep it on the
   * customer record, so it is read back from the session that raised them.
   */
  const contactLines = contact
    ? contact
        .split('·')
        .map((part) => part.trim())
        .filter(Boolean)
    : [user?.name, user?.email, user?.phone].filter(
        (part): part is string => Boolean(part),
      );

  const reporter = contactLines[0] ?? 'Та';

  const onSubmit = async ({ content }: ReplyValues) => {
    const result = await addNote({
      variables: { contentId: ticketId, content: content.trim() },
    }).catch(() => null);

    if (result?.data) {
      form.reset({ content: '' });
      toast({
        variant: 'success',
        title: 'Илгээлээ',
        description: 'Мессежийг хүсэлт дээр нэмлээ.',
      });
    }
  };

  /* A ticket nothing has happened to yet repeats one timestamp three times. */
  const created = formatDateTime(ticket.createdAt);
  const updated = formatDateTime(ticket.updatedAt);
  const statusChanged = ticket.statusChangedDate
    ? formatDateTime(ticket.statusChangedDate)
    : null;

  const meta = [
    { label: 'Үүсгэсэн', value: created },
    ...(updated !== created ? [{ label: 'Шинэчлэгдсэн', value: updated }] : []),
    ...(statusChanged && statusChanged !== created
      ? [{ label: 'Төлөв өөрчлөгдсөн', value: statusChanged }]
      : []),
  ];

  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 fill-mode-both duration-500">
      <header>
        <Link
          href="/tickets"
          className="inline-flex items-center gap-1.5 text-[13px] font-medium text-muted-foreground transition-colors hover:text-brand"
        >
          <Icon name="arrowLeft" size={15} />
          Бүх хүсэлт
        </Link>

        <h1 className="mt-3 text-[26px] font-semibold leading-snug text-ink">
          {ticket.name ?? 'Гарчиггүй хүсэлт'}
        </h1>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <StatusBadge status={ticket.status} />
          <PriorityBadge priority={ticket.priority} />
        </div>
      </header>

      <div className="mt-7 grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_290px]">
        {/*
         * The description is the reporter's opening message, so it heads the
         * same thread the replies land in rather than sitting in its own card.
         */}
        <Card className="order-2 overflow-hidden lg:order-1">
          <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-3.5">
            <h2 className="text-sm font-semibold text-ink">Харилцаа</h2>
            <span className="text-[13px] text-muted-foreground">
              {thread.length + 1} мессеж
            </span>
          </div>

          <ol className="divide-y divide-line">
            <Message
              author={reporter}
              team={false}
              at={ticket.createdAt}
              body={message || 'Тайлбар оруулаагүй байна.'}
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
            <p className="border-t border-line px-5 py-4 text-[13px] text-muted-foreground">
              Харилцааг ачаалж байна…
            </p>
          ) : notes.error ? (
            <div className="border-t border-line p-5">
              <LoadError
                title="Харилцааг татаж чадсангүй"
                message={notes.error.message}
              />
            </div>
          ) : !thread.length ? (
            <p className="flex items-center gap-2 border-t border-line px-5 py-4 text-[13px] text-muted-foreground">
              <Icon name="clock" size={15} className="shrink-0" />
              Дэмжлэгийн багийн хариу энд харагдана.
            </p>
          ) : null}

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              noValidate
              className="border-t border-line p-5"
            >
              <Form.Field
                control={form.control}
                name="content"
                render={({ field }) => (
                  <Form.Item>
                    <Form.Label
                      className="text-[13px] font-medium text-ink"
                      variant="peer"
                    >
                      Хариу бичих
                    </Form.Label>
                    <Form.Control>
                      <TextareaInput
                        {...field}
                        rows={3}
                        placeholder="Нэмэлт мэдээлэл эсвэл асуултаа бичнэ үү"
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

              <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                <p className="text-xs text-muted-foreground">
                  Илгээсэн мессежийг дэмжлэгийн баг шууд харна.
                </p>
                <Button type="submit" disabled={sending}>
                  <Icon name="send" size={15} />
                  {sending ? 'Илгээж байна…' : 'Илгээх'}
                </Button>
              </div>
            </form>
          </Form>
        </Card>

        <aside className="order-1 space-y-4 lg:order-2">
          <Card className="p-5">
            <h2 className="text-sm font-semibold text-ink">Хүсэлтийн дугаар</h2>
            <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">
              Нэвтрэхгүйгээр явцаа шалгахад энэ дугаарыг ашиглана.
            </p>
            <div className="mt-3">
              {ticket.number ? (
                <CopyNumber number={ticket.number} />
              ) : (
                <p className="text-sm text-muted-foreground">—</p>
              )}
            </div>
          </Card>

          {/* One card, so the rail reads as a single panel beside the thread. */}
          <Card className="divide-y divide-line">
            <div className="p-5">
              <h2 className="text-sm font-semibold text-ink">Дэлгэрэнгүй</h2>
              <dl className="mt-4 space-y-3.5">
                {meta.map((item) => (
                  <div
                    key={item.label}
                    className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5"
                  >
                    <dt className="text-[13px] text-muted-foreground">
                      {item.label}
                    </dt>
                    <dd className="break-words text-[13px] font-medium tabular-nums text-ink">
                      {item.value}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>

            {contactLines.length ? (
              <div className="p-5">
                <h2 className="text-sm font-semibold text-ink">Холбоо барих</h2>
                <ul className="mt-3 space-y-1.5">
                  {contactLines.map((part) => (
                    <li
                      key={part}
                      className="break-words text-sm leading-relaxed text-ink-soft"
                    >
                      {part}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </Card>
        </aside>
      </div>
    </div>
  );
};
