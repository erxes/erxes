import { Badge, type BadgeTone } from '@/modules/ui/components/Badge';
import { cn } from '@/modules/ui/lib/cn';
import { priorityLabel, type TicketStatusRef } from '../types';

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
  const tone = statusTone(status);

  return (
    <span className="inline-flex items-center gap-1.5 font-medium text-ink-soft">
      <StatusDot tone={tone} />
      {status?.name ?? 'No status'}
    </span>
  );
};

export const PriorityText = ({ priority }: { priority: number | null }) =>
  priority ? (
    <span className={cn('font-medium', toneText[toneForPriority(priority)])}>
      {priorityLabel(priority)}
    </span>
  ) : null;

export const StatusBadge = ({ status }: { status: TicketStatusRef }) => (
  <Badge tone={toneForStatusType(status?.type ?? null)}>
    {status?.name ?? 'No status'}
  </Badge>
);

export const PriorityBadge = ({ priority }: { priority: number | null }) =>
  priority ? (
    <Badge tone={toneForPriority(priority)}>{priorityLabel(priority)}</Badge>
  ) : null;
