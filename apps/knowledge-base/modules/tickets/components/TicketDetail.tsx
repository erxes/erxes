'use client';

import { useMutation, useQuery } from '@apollo/client/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form } from 'erxes-ui/components/form';
import { toast } from 'erxes-ui/hooks/use-toast';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Avatar } from '@/modules/ui/components/Avatar';
import { Button } from '@/modules/ui/components/Button';
import { Card } from '@/modules/ui/components/Card';
import { EmptyState } from '@/modules/ui/components/EmptyState';
import { TextareaInput } from '@/modules/ui/components/FormInput';
import { Icon } from '@/modules/ui/components/Icon';
import { LoadError } from '@/modules/ui/components/PortalState';
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

const Skeleton = () => (
  <Card className="space-y-3 p-6">
    <span className="block h-5 w-1/2 animate-pulse rounded bg-subtle" />
    <span className="block h-4 w-full animate-pulse rounded bg-subtle" />
    <span className="block h-4 w-2/3 animate-pulse rounded bg-subtle" />
  </Card>
);

const Message = ({
  author,
  at,
  body,
  origin,
}: {
  author: string;
  at: string | null;
  body: string;
  origin?: boolean;
}) => (
  <li className="flex gap-3.5 px-5 py-5">
    <Avatar name={author} size={34} className="mt-0.5 shrink-0" />
    <div className="min-w-0 flex-1">
      <div className="flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
        <span className="text-sm font-semibold text-ink">{author}</span>
        {origin ? (
          <span className="text-[13px] text-muted-foreground">
            хүсэлтийг үүсгэсэн
          </span>
        ) : null}
        <span className="ml-auto text-[13px] text-muted-foreground">
          {formatDateTime(at)}
        </span>
      </div>
      <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-ink-soft">
        {body}
      </p>
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
  const reporter = contact?.split('·')[0]?.trim() || 'Та';

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

  const meta = [
    { label: 'Үүсгэсэн', value: formatDateTime(ticket.createdAt) },
    { label: 'Шинэчлэгдсэн', value: formatDateTime(ticket.updatedAt) },
    ...(ticket.statusChangedDate
      ? [
          {
            label: 'Төлөв өөрчлөгдсөн',
            value: formatDateTime(ticket.statusChangedDate),
          },
        ]
      : []),
  ];

  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 fill-mode-both duration-500">
      <header>
        <h1 className="text-[26px] font-semibold leading-snug text-ink">
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
              at={ticket.createdAt}
              body={message || 'Тайлбар оруулаагүй байна.'}
              origin
            />

            {thread.map((note) => (
              <Message
                key={note._id}
                author={note.createdBy ?? 'Дэмжлэгийн баг'}
                at={note.createdAt}
                body={note.content ?? ''}
              />
            ))}
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
          ) : null}

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              noValidate
              className="border-t border-line bg-subtle/40 p-5"
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
                        rows={4}
                        className="bg-white"
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

              <div className="mt-4 flex justify-end">
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

          <Card className="p-5">
            <h2 className="text-sm font-semibold text-ink">Дэлгэрэнгүй</h2>
            <dl className="mt-4 space-y-3.5">
              {meta.map((item) => (
                <div key={item.label}>
                  <dt className="text-[13px] text-muted-foreground">
                    {item.label}
                  </dt>
                  <dd className="mt-0.5 break-words text-sm font-medium text-ink">
                    {item.value}
                  </dd>
                </div>
              ))}
            </dl>
          </Card>

          {contact ? (
            <Card className="p-5">
              <h2 className="text-sm font-semibold text-ink">Холбоо барих</h2>
              <ul className="mt-3 space-y-2">
                {contact.split('·').map((part) => (
                  <li
                    key={part}
                    className="break-words text-sm leading-relaxed text-ink-soft"
                  >
                    {part.trim()}
                  </li>
                ))}
              </ul>
            </Card>
          ) : null}
        </aside>
      </div>
    </div>
  );
};
