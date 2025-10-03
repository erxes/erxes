import { STATUS_TYPE_LABELS } from '@/operation/constants/statusConstants';
import {
  type Icon,
  IconCircle,
  IconCircleCheck,
  IconCircleDashed,
  IconCircleDot,
  IconCircleX,
} from '@tabler/icons-react';
import { cn } from 'erxes-ui';
import React from 'react';

export const STATUS_TYPES = {
  BACKLOG: 3,
  UNSTARTED: 2,
  STARTED: 1,
  COMPLETED: 4,
  CANCELLED: 5,
};

export const StatusInlineIcon = ({
  statusType = 0,
  style,
  className,
  color,
  ...props
}: React.ComponentProps<Icon> & { statusType?: number | string }) => {
  const numericType =
    (typeof statusType === 'string' ? parseInt(statusType, 10) : statusType) -
    1;
  const StatusIconComponent = [
    IconCircleDot,
    IconCircle,
    IconCircleDashed,
    IconCircleCheck,
    IconCircleX,
  ][numericType];

  const colorClassName = [
    'text-warning',
    'text-info',
    'text-muted-foreground',
    'text-success',
    'text-destructive',
  ][numericType];

  if (!StatusIconComponent) {
    return null;
  }

  return (
    <StatusIconComponent
      {...props}
      color={color ? color : undefined}
      className={cn('size-4 flex-none', colorClassName, className)}
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
    (typeof statusType === 'string' ? parseInt(statusType, 10) : statusType) -
    1;
  return <span className="capitalize">{STATUS_TYPE_LABELS[numericType]}</span>;
};
