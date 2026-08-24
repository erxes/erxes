'use client';

import { useQuery } from '@apollo/client/react';
import { useSession } from '@/modules/auth/SessionProvider';
import { ButtonLink } from '@/modules/ui/Button';
import { Card } from '@/modules/ui/Card';
import { EmptyState } from '@/modules/ui/EmptyState';
import { LoadError } from '@/modules/ui/PortalState';
import { TICKET_PORTAL_LIST } from '../graphql/queries/tickets';
import type { Ticket } from '../types';
import { TicketListItem } from './TicketListItem';

type ListResponse = { cpGetTickets: Ticket[] | null };

const Skeleton = () => (
  <Card className="space-y-4 p-6">
    {[0, 1, 2].map((row) => (
      <span key={row} className="block space-y-2">
        <span className="block h-4 w-40 animate-pulse rounded bg-subtle" />
        <span className="block h-4 w-3/4 animate-pulse rounded bg-subtle" />
      </span>
    ))}
  </Card>
);

export const MyTickets = () => {
  const { user, ready } = useSession();
  const cpUserId = user?.cpUserId;

  const { data, loading, error } = useQuery<ListResponse>(TICKET_PORTAL_LIST, {
    variables: { filter: { createdBy: cpUserId, perPage: 20 } },
    skip: !cpUserId,
  });

  if (!ready) {
    return <Skeleton />;
  }

  if (!cpUserId) {
    return (
      <EmptyState
        icon="user"
        title="Хүсэлтийн түүх нэвтэрсний дараа харагдана"
        description="Одоохондоо хүсэлтийнхээ дугаараар явцаа шалгах боломжтой."
        action={
          <ButtonLink href="/tickets/track" size="sm" variant="secondary">
            Дугаараар хайх
          </ButtonLink>
        }
      />
    );
  }

  if (loading) {
    return <Skeleton />;
  }

  if (error) {
    return (
      <LoadError title="Хүсэлтүүдийг татаж чадсангүй" message={error.message} />
    );
  }

  const tickets = data?.cpGetTickets ?? [];

  if (!tickets.length) {
    return (
      <EmptyState
        icon="ticket"
        title="Хүсэлт байхгүй байна"
        description="Та одоогоор дэмжлэгийн хүсэлт үүсгээгүй байна."
        action={
          <ButtonLink href="/tickets/new" size="sm">
            Хүсэлт үүсгэх
          </ButtonLink>
        }
      />
    );
  }

  return (
    <Card className="p-2">
      <ul className="divide-y divide-line">
        {tickets.map((ticket) => (
          <TicketListItem key={ticket._id} ticket={ticket} />
        ))}
      </ul>
    </Card>
  );
};
