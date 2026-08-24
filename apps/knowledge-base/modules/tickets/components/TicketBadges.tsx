import { Badge, type BadgeTone } from '@/modules/ui/Badge';
import { priorityLabel, type TicketStatusRef } from '../types';

/** Pipeline status types: 1 = active, 2 = in progress, 3 = resolved/closed. */
const toneForStatusType = (type: number | null): BadgeTone => {
  if (type === 3) {
    return 'success';
  }

  if (type === 2) {
    return 'warning';
  }

  return 'brand';
};

const toneForPriority = (priority: number | null): BadgeTone => {
  if (priority === 4) {
    return 'danger';
  }

  if (priority === 3) {
    return 'warning';
  }

  return 'neutral';
};

export const StatusBadge = ({ status }: { status: TicketStatusRef }) => (
  <Badge tone={toneForStatusType(status?.type ?? null)}>
    {status?.name ?? 'Төлөвгүй'}
  </Badge>
);

export const PriorityBadge = ({ priority }: { priority: number | null }) =>
  priority ? (
    <Badge tone={toneForPriority(priority)}>{priorityLabel(priority)}</Badge>
  ) : null;
