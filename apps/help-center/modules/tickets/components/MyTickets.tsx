'use client';

import { useQuery } from '@apollo/client/react';
import { useSession } from '@/modules/auth/components/SessionProvider';
import { ButtonLink } from '@/modules/ui/components/Button';
import { Card } from '@/modules/ui/components/Card';
import { EmptyState } from '@/modules/ui/components/EmptyState';
import { LoadError } from '@/modules/ui/components/PortalState';
import { TICKET_PORTAL_LIST } from '../graphql/queries/tickets';
import type { Ticket } from '../types';
import { TicketListItem } from './TicketListItem';

type ListResponse = { cpGetTickets: Ticket[] | null };

const Skeleton = () => (
  <ul className="flex flex-col gap-2.5">
    {[0, 1, 2].map((row) => (
      <li key={row}>
        <Card className="py-4 pl-6 pr-4 sm:pl-7 sm:pr-5">
          <span className="block h-4 w-2/5 animate-pulse rounded bg-subtle" />
          <span className="mt-3 block h-3 w-3/5 animate-pulse rounded bg-subtle" />
        </Card>
      </li>
    ))}
  </ul>
);

export const MyTickets = ({ limit = 20 }: { limit?: number }) => {
  const { user, ready } = useSession();

  const requesterId = user?.customerId ?? user?.cpUserId;

  const { data, loading, error } = useQuery<ListResponse>(TICKET_PORTAL_LIST, {
    variables: { filter: { createdBy: requesterId, perPage: limit } },
    skip: !requesterId,
  });

  if (!ready) {
    return <Skeleton />;
  }

  if (!requesterId) {
    return (
      <EmptyState
        icon="user"
        title="Sign in to see your tickets"
        description="Or check progress with your ticket number."
        action={
          <ButtonLink href="/tickets/track" size="sm" variant="secondary">
            Search by number
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
      <LoadError title="Could not load your tickets" message={error.message} />
    );
  }

  const tickets = data?.cpGetTickets ?? [];

  if (!tickets.length) {
    return (
      <EmptyState
        icon="ticket"
        title="No tickets yet"
        description="You have not created a support ticket yet."
        action={
          <ButtonLink href="/tickets/new" size="sm">
            Create a ticket
          </ButtonLink>
        }
      />
    );
  }

  return (
    <ul className="flex flex-col gap-2.5">
      {tickets.map((ticket) => (
        <TicketListItem key={ticket._id} ticket={ticket} />
      ))}
    </ul>
  );
};
