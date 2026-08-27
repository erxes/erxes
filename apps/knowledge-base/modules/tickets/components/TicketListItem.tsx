import Link from 'next/link';
import { Icon } from '@/modules/ui/components/Icon';
import { formatDateTime } from '../utils/format';
import type { Ticket } from '../types';
import { PriorityBadge, StatusBadge } from './TicketBadges';

export const TicketListItem = ({ ticket }: { ticket: Ticket }) => (
  <li>
    <Link
      href={`/tickets/${ticket._id}`}
      className="flex items-start gap-4 rounded-lg px-4 py-4 transition-colors hover:bg-subtle"
    >
      <span className="mt-0.5 text-muted-foreground">
        <Icon name="ticket" size={18} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex flex-wrap items-center gap-2">
          {ticket.number ? (
            <span className="text-[13px] font-semibold text-brand">
              {ticket.number}
            </span>
          ) : null}
          <StatusBadge status={ticket.status} />
          <PriorityBadge priority={ticket.priority} />
        </span>
        <span className="mt-1.5 block text-[15px] font-semibold text-ink">
          {ticket.name ?? 'Гарчиггүй хүсэлт'}
        </span>
        <span className="mt-1 block text-[13px] text-muted-foreground">
          Шинэчлэгдсэн {formatDateTime(ticket.updatedAt ?? ticket.createdAt)}
        </span>
      </span>
      <span className="mt-1 text-muted-foreground">
        <Icon name="chevronRight" size={16} />
      </span>
    </Link>
  </li>
);
