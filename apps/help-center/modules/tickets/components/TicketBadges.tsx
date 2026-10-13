'use client';

import { useT } from '@/modules/i18n/components/LocaleProvider';
import { Badge, type BadgeTone } from '@/modules/ui/components/Badge';
import { cn } from '@/modules/ui/lib/cn';
import { TICKET_STATUS_TYPES } from '../constants/status';
import { priorityLabel, type TicketStatusRef } from '../types';

const toneForStatusType = (type: number | null): BadgeTone => {
  switch (type) {
    case TICKET_STATUS_TYPES.IN_PROGRESS:
      return 'warning';
    case TICKET_STATUS_TYPES.RESOLVED:
      return 'success';
    case TICKET_STATUS_TYPES.CLOSED:
      return 'neutral';
    case TICKET_STATUS_TYPES.CANCELLED:
      return 'danger';
    default:
      return 'brand';
  }
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

export const statusTone = (status: TicketStatusRef): BadgeTone =>
  toneForStatusType(status?.type ?? null);

export const toneSurface: Record<BadgeTone, string> = {
  neutral: 'bg-muted-foreground',
  brand: 'bg-brand',
  success: 'bg-success',
  warning: 'bg-warning',
  danger: 'bg-danger',
};

const toneHalo: Record<BadgeTone, string> = {
  neutral: 'ring-line',
  brand: 'ring-brand-soft',
  success: 'ring-success-soft',
  warning: 'ring-warning-soft',
  danger: 'ring-danger-soft',
};

const toneText: Record<BadgeTone, string> = {
  neutral: 'text-muted-foreground',
  brand: 'text-brand',
  success: 'text-success',
  warning: 'text-warning',
  danger: 'text-danger',
};

export const StatusDot = ({ tone }: { tone: BadgeTone }) => (
  <span
    aria-hidden="true"
    className={cn(
      'size-2 shrink-0 rounded-full ring-2',
      toneSurface[tone],
      toneHalo[tone],
    )}
  />
);

export const StatusText = ({ status }: { status: TicketStatusRef }) => {
  const t = useT();
  const tone = statusTone(status);

  return (
    <span className="inline-flex items-center gap-1.5 font-medium text-ink-soft">
      <StatusDot tone={tone} />
      {status?.name ?? t('tickets.noStatus')}
    </span>
  );
};

export const PriorityText = ({ priority }: { priority: number | null }) => {
  const t = useT();

  return priority ? (
    <span className={cn('font-medium', toneText[toneForPriority(priority)])}>
      {priorityLabel(priority, t)}
    </span>
  ) : null;
};

export const StatusBadge = ({ status }: { status: TicketStatusRef }) => {
  const t = useT();

  return (
    <Badge tone={toneForStatusType(status?.type ?? null)}>
      {status?.name ?? t('tickets.noStatus')}
    </Badge>
  );
};

export const PriorityBadge = ({ priority }: { priority: number | null }) => {
  const t = useT();

  return priority ? (
    <Badge tone={toneForPriority(priority)}>{priorityLabel(priority, t)}</Badge>
  ) : null;
};
