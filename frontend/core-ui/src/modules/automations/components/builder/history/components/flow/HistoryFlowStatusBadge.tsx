import {
  EXECUTION_STATUS_LABEL_KEYS,
  TExecutionStatus,
} from '@/automations/utils/automationHistoryUtils/executionFormat';
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
  { icon: React.ElementType; className: string }
> = {
  success: {
    icon: IconCheck,
    className: 'border-success/40 bg-success/10 text-success',
  },
  skipped: {
    icon: IconArrowRight,
    className: 'border-muted-foreground/40 bg-muted text-muted-foreground',
  },
  error: {
    icon: IconX,
    className: 'border-destructive/40 bg-destructive/10 text-destructive',
  },
  waiting: {
    icon: IconClock,
    className: 'border-warning/40 bg-warning/10 text-warning',
  },
  queued: {
    icon: IconHourglass,
    className: 'border-warning/40 bg-warning/10 text-warning',
  },
  standby: {
    icon: IconPlayerPause,
    className: 'border-warning/40 bg-warning/10 text-warning',
  },
  dropped: {
    icon: IconBan,
    className: 'border-muted-foreground/40 bg-muted text-muted-foreground',
  },
};

export const HistoryFlowStatusBadge = ({
  status,
}: {
  status: TExecutionStatus;
}) => {
  const { t } = useTranslation('automations');
  const { icon: Icon, className } = STATUS_MAP[status];
  const label = t(EXECUTION_STATUS_LABEL_KEYS[status]);

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
