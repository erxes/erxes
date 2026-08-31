'use client';

import { useQuery } from '@apollo/client/react';
import { useSession } from '@/modules/auth/components/SessionProvider';
import { ButtonLink } from '@/modules/ui/components/Button';
import { Card } from '@/modules/ui/components/Card';
import { EmptyState } from '@/modules/ui/components/EmptyState';
import { LoadError } from '@/modules/ui/components/PortalState';
import { cn } from '@/modules/ui/lib/cn';
import { TICKET_PORTAL_LIST } from '../graphql/queries/tickets';
import type { Ticket } from '../types';
import { TicketListItem } from './TicketListItem';

type ListResponse = { cpGetTickets: Ticket[] | null };

const Skeleton = ({ framed }: { framed: boolean }) => {
  const rows = (
    <div className="space-y-4">
      {[0, 1, 2].map((row) => (
        <span key={row} className="block space-y-2">
          <span className="block h-4 w-40 animate-pulse rounded bg-subtle" />
          <span className="block h-4 w-3/4 animate-pulse rounded bg-subtle" />
        </span>
      ))}
    </div>
  );

  return framed ? <Card className="p-6">{rows}</Card> : rows;
};

export const MyTickets = ({
  limit = 20,
  framed = true,
}: {
  limit?: number;
  /** Off where the list already sits inside a panel, so surfaces do not nest. */
  framed?: boolean;
}) => {
  const { user, ready } = useSession();

  /*
   * `cpCreateTicket` files a ticket under the requester's linked erxes customer
   * and only falls back to the portal user id when there is none, so the list
   * has to be asked for with the same id or it comes back empty.
   */
  const requesterId = user?.customerId ?? user?.cpUserId;

  const { data, loading, error } = useQuery<ListResponse>(TICKET_PORTAL_LIST, {
    variables: { filter: { createdBy: requesterId, perPage: limit } },
    skip: !requesterId,
  });

  if (!ready) {
    return <Skeleton framed={framed} />;
  }

  if (!requesterId) {
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
    return <Skeleton framed={framed} />;
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

  const list = (
    <ul className={cn('divide-y divide-line', !framed && '-mx-2')}>
      {tickets.map((ticket) => (
        <TicketListItem key={ticket._id} ticket={ticket} />
      ))}
    </ul>
  );

  return framed ? <Card className="p-2">{list}</Card> : list;
};
