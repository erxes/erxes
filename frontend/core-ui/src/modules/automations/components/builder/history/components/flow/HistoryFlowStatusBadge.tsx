import { TExecutionStatus } from '@/automations/utils/automationHistoryUtils/executionFormat';
import { IconCheck, IconClock, IconX } from '@tabler/icons-react';
import { cn } from 'erxes-ui';

const STATUS_MAP: Record<
  TExecutionStatus,
  { icon: React.ElementType; className: string; label: string }
> = {
  success: {
    icon: IconCheck,
    className: 'border-success/40 bg-success/10 text-success',
    label: 'Succeeded',
  },
  error: {
    icon: IconX,
    className: 'border-destructive/40 bg-destructive/10 text-destructive',
    label: 'Failed',
  },
  waiting: {
    icon: IconClock,
    className: 'border-warning/40 bg-warning/10 text-warning',
    label: 'Waiting',
  },
};

export const HistoryFlowStatusBadge = ({
  status,
}: {
  status: TExecutionStatus;
}) => {
  const { icon: Icon, className, label } = STATUS_MAP[status];

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
