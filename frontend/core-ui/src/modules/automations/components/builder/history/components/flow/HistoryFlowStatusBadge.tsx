import { TExecutionStatus } from '@/automations/utils/automationHistoryUtils/executionFormat';
import {
  IconArrowRight,
  IconBan,
  IconCheck,
  IconClock,
  IconHourglass,
  IconPlayerPause,
  IconX,
} from '@tabler/icons-react';
import { cn } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

const STATUS_MAP: Record<
  TExecutionStatus,
  { icon: React.ElementType; className: string; labelKey: string }
> = {
  success: {
    icon: IconCheck,
    className: 'border-success/40 bg-success/10 text-success',
    labelKey: 'history-status-succeeded',
  },
  skipped: {
    icon: IconArrowRight,
    className: 'border-muted-foreground/40 bg-muted text-muted-foreground',
    labelKey: 'history-status-skipped',
  },
  error: {
    icon: IconX,
    className: 'border-destructive/40 bg-destructive/10 text-destructive',
    labelKey: 'history-status-failed',
  },
  waiting: {
    icon: IconClock,
    className: 'border-warning/40 bg-warning/10 text-warning',
    labelKey: 'history-status-waiting',
  },
  queued: {
    icon: IconHourglass,
    className: 'border-warning/40 bg-warning/10 text-warning',
    labelKey: 'history-status-queued',
  },
  standby: {
    icon: IconPlayerPause,
    className: 'border-warning/40 bg-warning/10 text-warning',
    labelKey: 'history-status-standby',
  },
  dropped: {
    icon: IconBan,
    className: 'border-muted-foreground/40 bg-muted text-muted-foreground',
    labelKey: 'history-status-dropped',
  },
};

export const HistoryFlowStatusBadge = ({
  status,
}: {
  status: TExecutionStatus;
}) => {
  const { t } = useTranslation('automations');
  const { icon: Icon, className, labelKey } = STATUS_MAP[status];
  const label = t(labelKey);

  return (
    <span
      aria-label={label}
      title={label}
      className={cn('rounded border p-1 cursor-pointer', className)}
    >
      <Icon className="size-3.5" />
    </span>
  );
};
