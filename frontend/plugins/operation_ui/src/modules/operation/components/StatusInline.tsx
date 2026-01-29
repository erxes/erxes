import { STATUS_TYPE_LABELS } from '@/operation/constants/statusConstants';
import {
  type Icon,
  IconCircle,
  IconCircleCheck,
  IconCircleDashed,
  IconCircleDot,
  IconCircleX,
  IconClipboardList,
} from '@tabler/icons-react';
import { cn } from 'erxes-ui';
import React from 'react';

export const STATUS_TYPES = {
  STARTED: 1,
  UNSTARTED: 2,
  BACKLOG: 3,
  COMPLETED: 4,
  CANCELLED: 5,
  TRIAGE: 6,
};

const STATUS_CONFIG: Record<
  number,
  { icon: Icon; color: string; label: string }
> = {
  [STATUS_TYPES.STARTED]: {
    icon: IconCircleDot,
    color: 'text-warning',
    label: STATUS_TYPE_LABELS[0],
  },
  [STATUS_TYPES.UNSTARTED]: {
    icon: IconCircle,
    color: 'text-info',
    label: STATUS_TYPE_LABELS[1],
  },
  [STATUS_TYPES.BACKLOG]: {
    icon: IconCircleDashed,
    color: 'text-muted-foreground',
    label: STATUS_TYPE_LABELS[2],
  },
  [STATUS_TYPES.COMPLETED]: {
    icon: IconCircleCheck,
    color: 'text-success',
    label: STATUS_TYPE_LABELS[3],
  },
  [STATUS_TYPES.CANCELLED]: {
    icon: IconCircleX,
    color: 'text-destructive',
    label: STATUS_TYPE_LABELS[4],
  },
  [STATUS_TYPES.TRIAGE]: {
    icon: IconClipboardList,
    color: 'text-purple-500',
    label: STATUS_TYPE_LABELS[5],
  },
};

export const StatusInlineIcon = ({
  statusType = 0,
  style,
  className,
  color,
  ...props
}: React.ComponentProps<Icon> & { statusType?: number | string }) => {
  const numericType =
    typeof statusType === 'string' ? parseInt(statusType, 10) : statusType;

  const config = STATUS_CONFIG[numericType];

  if (!config) {
    return null;
  }

  const { icon: StatusIconComponent, color: defaultColor } = config;

  return (
    <StatusIconComponent
      {...props}
      color={color ? color : undefined}
      className={cn('size-4 flex-none', defaultColor, className)}
    />
  );
};

StatusInlineIcon.displayName = 'StatusInlineIcon';

export const StatusInlineLabel = ({
  statusType = 1,
}: {
  statusType?: number | string;
}) => {
  const numericType =
    typeof statusType === 'string' ? parseInt(statusType, 10) : statusType;

  const config = STATUS_CONFIG[numericType];

  return <span className="capitalize">{config?.label || ''}</span>;
};
