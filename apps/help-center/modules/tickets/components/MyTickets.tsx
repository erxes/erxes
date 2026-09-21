'use client';

import { useQuery } from '@apollo/client/react';
import { useMemo, useState } from 'react';
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

type FilterKey = 'all' | 'open' | 'progress' | 'done';

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'open', label: 'Open' },
  { key: 'progress', label: 'In progress' },
  { key: 'done', label: 'Resolved' },
];

const bucketOf = (ticket: Ticket): Exclude<FilterKey, 'all'> => {
  const type = ticket.status?.type ?? null;

  if (type === 3) {
    return 'done';
  }

  return type === 2 ? 'progress' : 'open';
};

const Skeleton = () => (
  <Card className="divide-y divide-line overflow-hidden">
    {[0, 1, 2].map((row) => (
      <div key={row} className="px-5 py-4">
        <span className="block h-4 w-2/5 animate-pulse rounded bg-subtle" />
        <span className="mt-3 block h-3 w-3/5 animate-pulse rounded bg-subtle" />
      </div>
    ))}
  </Card>
);

export const MyTickets = ({ limit = 20 }: { limit?: number }) => {
  const { user, ready } = useSession();
  const [filter, setFilter] = useState<FilterKey>('all');

  const requesterId = user?.customerId ?? user?.cpUserId;

  const { data, loading, error } = useQuery<ListResponse>(TICKET_PORTAL_LIST, {
    variables: { filter: { createdBy: requesterId, perPage: limit } },
    skip: !requesterId,
  });

  const tickets = useMemo(() => data?.cpGetTickets ?? [], [data]);

  const counts = useMemo(() => {
    const totals = { all: tickets.length, open: 0, progress: 0, done: 0 };

    for (const ticket of tickets) {
      totals[bucketOf(ticket)] += 1;
    }

    return totals;
  }, [tickets]);

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

  const shown =
    filter === 'all'
      ? tickets
      : tickets.filter((ticket) => bucketOf(ticket) === filter);

  return (
    <div>
      <div className="flex flex-wrap gap-1.5">
        {FILTERS.map((entry) => {
          const active = entry.key === filter;

          return (
            <button
              key={entry.key}
              type="button"
              onClick={() => setFilter(entry.key)}
              aria-pressed={active}
              className={cn(
                'inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-[13px] font-medium outline-none transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-brand/30',
                active
                  ? 'border-brand bg-brand text-white'
                  : 'border-line bg-white text-ink-soft hover:border-line-strong hover:text-ink',
              )}
            >
              {entry.label}
              <span
                className={cn(
                  'tabular-nums',
                  active ? 'text-white/80' : 'text-muted-foreground',
                )}
              >
                {counts[entry.key]}
              </span>
            </button>
          );
        })}
      </div>

      {shown.length ? (
        <Card className="mt-4 divide-y divide-line overflow-hidden">
          <ul className="divide-y divide-line">
            {shown.map((ticket) => (
              <TicketListItem key={ticket._id} ticket={ticket} />
            ))}
          </ul>
        </Card>
      ) : (
        <p className="mt-4 rounded-xl border border-line bg-white px-5 py-6 text-sm text-muted-foreground">
          No tickets in this state.
        </p>
      )}
    </div>
  );
};
