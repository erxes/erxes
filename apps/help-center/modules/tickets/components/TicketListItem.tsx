import Link from 'next/link';
import { Icon } from '@/modules/ui/components/Icon';
import { cn } from '@/modules/ui/lib/cn';
import { formatDateTime, formatRelativeTime } from '../utils/format';
import type { Ticket } from '../types';
import { PriorityText, statusTone, StatusText } from './TicketBadges';

const toneStripe: Record<string, string> = {
  neutral: 'bg-muted-foreground/40',
  brand: 'bg-brand',
  success: 'bg-success',
  warning: 'bg-warning',
  danger: 'bg-danger',
};

export const TicketListItem = ({ ticket }: { ticket: Ticket }) => {
  const tone = statusTone(ticket.status);
  const updated = ticket.updatedAt ?? ticket.createdAt;

  return (
    <li>
      <Link
        href={`/tickets/${ticket._id}`}
        className="group flex items-stretch gap-4 px-5 py-4 outline-none transition-colors duration-150 hover:bg-subtle/70 focus-visible:bg-subtle"
      >
        <span
          aria-hidden="true"
          className={cn(
            'w-0.5 shrink-0 rounded-full',
            toneStripe[tone] ?? toneStripe.neutral,
          )}
        />

        <span className="min-w-0 flex-1">
          <span className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
            {ticket.number ? (
              <span className="font-mono text-xs text-muted-foreground">
                #{ticket.number}
              </span>
            ) : null}
            <span className="min-w-0 flex-1 truncate text-[15px] font-medium text-ink transition-colors duration-150 group-hover:text-brand">
              {ticket.name ?? 'Untitled ticket'}
            </span>
          </span>

          <span className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] text-muted-foreground">
            <StatusText status={ticket.status} />
            {ticket.priority ? (
              <PriorityText priority={ticket.priority} />
            ) : null}
            <span title={formatDateTime(updated)}>
              {formatRelativeTime(updated)}
            </span>
          </span>
        </span>

        <Icon
          name="chevronRight"
          size={16}
          className="mt-1 shrink-0 self-start text-muted-foreground/60 transition-[transform,color] duration-150 group-hover:translate-x-0.5 group-hover:text-brand"
        />
      </Link>
    </li>
  );
};
