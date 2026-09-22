import { CardLink } from '@/modules/ui/components/Card';
import { Icon } from '@/modules/ui/components/Icon';
import { cn } from '@/modules/ui/lib/cn';
import { formatDateTime, formatRelativeTime } from '../utils/format';
import type { Ticket } from '../types';
import {
  PriorityText,
  statusTone,
  StatusText,
  toneSurface,
} from './TicketBadges';

const MetaDot = () => (
  <span
    aria-hidden="true"
    className="size-1 rounded-full bg-muted-foreground/40"
  />
);

export const TicketListItem = ({ ticket }: { ticket: Ticket }) => {
  const tone = statusTone(ticket.status);
  const updated = ticket.updatedAt ?? ticket.createdAt;

  return (
    <li>
      <CardLink
        href={`/tickets/${ticket._id}`}
        className="group relative overflow-hidden py-4 pl-6 pr-4 sm:pl-7 sm:pr-5"
      >
        <span
          aria-hidden="true"
          className={cn(
            'absolute inset-y-0 left-0 w-1 transition-[width] duration-200 group-hover:w-1.5',
            toneSurface[tone],
          )}
        />

        <span className="flex items-center gap-4">
          <span className="min-w-0 flex-1">
            <span className="block truncate text-[15px] font-semibold text-ink transition-colors duration-200 group-hover:text-brand">
              {ticket.name ?? 'Untitled ticket'}
            </span>

            <span className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1.5 text-[13px] text-muted-foreground">
              <StatusText status={ticket.status} />

              {ticket.priority ? (
                <>
                  <MetaDot />
                  <PriorityText priority={ticket.priority} />
                </>
              ) : null}

              {ticket.number ? (
                <>
                  <MetaDot />
                  <span className="font-mono text-xs tracking-tight">
                    #{ticket.number}
                  </span>
                </>
              ) : null}

              <span className="flex items-center gap-2 sm:hidden">
                <MetaDot />
                {formatRelativeTime(updated)}
              </span>
            </span>
          </span>

          <span className="flex shrink-0 items-center gap-3">
            <span
              className="hidden text-[13px] text-muted-foreground sm:block"
              title={formatDateTime(updated)}
            >
              {formatRelativeTime(updated)}
            </span>
            <Icon
              name="chevronRight"
              size={16}
              className="text-muted-foreground transition-[transform,color] duration-200 group-hover:translate-x-0.5 group-hover:text-brand"
            />
          </span>
        </span>
      </CardLink>
    </li>
  );
};
