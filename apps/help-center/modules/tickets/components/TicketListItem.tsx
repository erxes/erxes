import Link from 'next/link';
import { Icon } from '@/modules/ui/components/Icon';
import { formatDateTime, formatRelativeTime } from '../utils/format';
import type { Ticket } from '../types';
import { PriorityText, StatusText } from './TicketBadges';

export const TicketListItem = ({ ticket }: { ticket: Ticket }) => {
  const updated = ticket.updatedAt ?? ticket.createdAt;

  return (
    <li>
      <Link
        href={`/tickets/${ticket._id}`}
        className="group flex items-start gap-4 rounded-xl px-5 py-4 outline-none transition-colors duration-300 ease-out-soft hover:bg-subtle focus-visible:bg-subtle"
      >
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[15px] font-semibold leading-snug text-ink transition-colors duration-300 group-hover:text-brand">
            {ticket.name ?? 'Untitled ticket'}
          </span>

          <span className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] text-muted-foreground">
            {ticket.number ? (
              <span className="font-mono tabular-nums">#{ticket.number}</span>
            ) : null}
            <StatusText status={ticket.status} />
            {ticket.priority ? (
              <PriorityText priority={ticket.priority} />
            ) : null}
          </span>
        </span>

        <span
          title={formatDateTime(updated)}
          className="hidden shrink-0 items-center gap-1.5 pt-0.5 text-[12px] tabular-nums text-muted-foreground sm:flex"
        >
          <Icon name="clock" size={13} />
          {formatRelativeTime(updated)}
        </span>

        <span
          aria-hidden="true"
          className="mt-0.5 shrink-0 text-muted-foreground/40 transition-[transform,color] duration-500 ease-out-soft group-hover:translate-x-1 group-hover:text-brand"
        >
          <Icon name="chevronRight" size={16} />
        </span>
      </Link>
    </li>
  );
};
