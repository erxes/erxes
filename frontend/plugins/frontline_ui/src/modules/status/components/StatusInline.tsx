import {
  TICKET_STATUS_TYPE_NAMES,
} from '@/status/constants';
import {
  type Icon,
  IconCircle,
  IconCircleCheck,
  IconCircleDashed,
  IconCircleDashedCheck,
  IconCircleDot,
  IconCircleX,
} from '@tabler/icons-react';
import { cn } from 'erxes-ui';
import React from 'react';

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
    IconCircle,
    IconCircleDot,
    IconCircleDashed,
    IconCircleCheck,
    IconCircleDashedCheck,
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
    typeof statusType === 'string' ? parseInt(statusType, 10) : statusType;
  return (
    <span className="capitalize">{TICKET_STATUS_TYPE_NAMES[numericType]}</span>
  );
};
