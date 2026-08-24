'use client';

import { useMutation, useQuery } from '@apollo/client/react';
import { useState, type FormEvent } from 'react';
import { Avatar } from '@/modules/ui/Avatar';
import { Button } from '@/modules/ui/Button';
import { Card } from '@/modules/ui/Card';
import { EmptyState } from '@/modules/ui/EmptyState';
import { Field, TextArea } from '@/modules/ui/Field';
import { Icon } from '@/modules/ui/Icon';
import { LoadError } from '@/modules/ui/PortalState';
import { TICKET_PORTAL_ADD_NOTE } from '../graphql/mutations/tickets';
import {
  TICKET_PORTAL_DETAIL,
  TICKET_PORTAL_NOTES,
} from '../graphql/queries/tickets';
import { formatDateTime } from '../format';
import type { Ticket, TicketNote } from '../types';
import { PriorityBadge, StatusBadge } from './TicketBadges';

type DetailResponse = { cpGetTicket: Ticket | null };
type NotesResponse = { cpTicketGetNotes: TicketNote[] | null };

const Skeleton = () => (
  <Card className="space-y-3 p-6">
    <span className="block h-5 w-1/2 animate-pulse rounded bg-subtle" />
    <span className="block h-4 w-full animate-pulse rounded bg-subtle" />
    <span className="block h-4 w-2/3 animate-pulse rounded bg-subtle" />
  </Card>
);

export const TicketDetail = ({ ticketId }: { ticketId: string }) => {
  const [reply, setReply] = useState('');
  const [replyError, setReplyError] = useState<string | undefined>();

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
      // Keep the thread current the moment a reply lands.
      refetchQueries: [
        { query: TICKET_PORTAL_NOTES, variables: { ticketId } },
      ],
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

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (reply.trim().length < 2) {
      setReplyError('Хариу мессежээ бичнэ үү.');
      return;
    }

    setReplyError(undefined);

    const result = await addNote({
      variables: { contentId: ticketId, content: reply.trim() },
    }).catch(() => null);

    if (result?.data) {
      setReply('');
    }
  };

  const meta = [
    { label: 'Хүсэлтийн дугаар', value: ticket.number ?? '—' },
    { label: 'Төлөв', value: ticket.status?.name ?? '—' },
    { label: 'Үүсгэсэн', value: formatDateTime(ticket.createdAt) },
    { label: 'Шинэчлэгдсэн', value: formatDateTime(ticket.updatedAt) },
  ];

  return (
    <>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-[26px] font-semibold leading-snug text-ink">
            {ticket.name ?? 'Гарчиггүй хүсэлт'}
          </h1>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <StatusBadge status={ticket.status} />
            <PriorityBadge priority={ticket.priority} />
          </div>
        </div>
      </div>

      <div className="mt-7 grid gap-8 lg:grid-cols-[1fr_300px]">
        <div className="order-2 space-y-4 lg:order-1">
          <Card className="p-5">
            <p className="text-sm font-semibold uppercase tracking-wide text-muted">
              Хүсэлтийн тайлбар
            </p>
            <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-ink-soft">
              {ticket.description?.trim() || 'Тайлбар оруулаагүй байна.'}
            </p>
          </Card>

          {notes.loading ? (
            <Skeleton />
          ) : notes.error ? (
            <LoadError
              title="Харилцааг татаж чадсангүй"
              message={notes.error.message}
            />
          ) : thread.length ? (
            <ol className="space-y-4">
              {thread.map((note) => (
                <li
                  key={note._id}
                  className="rounded-xl border border-line bg-white p-5"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="flex items-center gap-2.5">
                      <Avatar name={note.createdBy ?? 'erxes'} size={30} />
                      <span className="text-sm font-semibold text-ink">
                        {note.createdBy ?? 'Дэмжлэгийн баг'}
                      </span>
                    </span>
                    <span className="text-[13px] text-muted">
                      {formatDateTime(note.createdAt)}
                    </span>
                  </div>
                  <p className="mt-3.5 whitespace-pre-line text-sm leading-relaxed text-ink-soft">
                    {note.content}
                  </p>
                </li>
              ))}
            </ol>
          ) : (
            <EmptyState
              icon="inbox"
              title="Харилцаа хоосон байна"
              description="Энэ хүсэлт дээр одоогоор мессеж алга. Нэмэлт мэдээлэл бичиж болно."
            />
          )}

          <form
            onSubmit={handleSubmit}
            noValidate
            className="rounded-xl border border-line bg-white p-5"
          >
            <Field label="Хариу бичих" htmlFor="ticket-reply" error={replyError}>
              <TextArea
                id="ticket-reply"
                rows={4}
                value={reply}
                invalid={Boolean(replyError)}
                onChange={(event) => {
                  setReply(event.target.value);
                  setReplyError(undefined);
                }}
                placeholder="Нэмэлт мэдээлэл эсвэл асуултаа бичнэ үү"
              />
            </Field>

            {sendError ? (
              <p
                role="alert"
                className="mt-3 flex items-start gap-2 text-[13px] text-danger"
              >
                <Icon name="alert" size={15} className="mt-px shrink-0" />
                {sendError.message}
              </p>
            ) : null}

            <div className="mt-4 flex justify-end">
              <Button type="submit" disabled={sending}>
                <Icon name="send" size={16} />
                {sending ? 'Илгээж байна…' : 'Илгээх'}
              </Button>
            </div>
          </form>
        </div>

        <aside className="order-1 lg:order-2">
          <Card className="p-5">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">
              Дэлгэрэнгүй
            </h2>
            <dl className="mt-4 space-y-3.5">
              {meta.map((item) => (
                <div key={item.label}>
                  <dt className="text-[13px] text-muted">{item.label}</dt>
                  <dd className="mt-0.5 break-words text-sm font-semibold text-ink">
                    {item.value}
                  </dd>
                </div>
              ))}
            </dl>
          </Card>
        </aside>
      </div>
    </>
  );
};
