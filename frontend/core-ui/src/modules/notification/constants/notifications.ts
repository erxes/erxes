import {
  IconAlertSquareRounded,
  IconInfoSquareRounded,
  IconSquareRoundedCheck,
  IconSquareRoundedX,
} from '@tabler/icons-react';

export const NOTIFICATION_TYPE_ICONS = {
  info: IconInfoSquareRounded,
  success: IconSquareRoundedCheck,
  warning: IconAlertSquareRounded,
  error: IconSquareRoundedX,
};

export const NOTIFICATION_TYPE_COLORS = {
  info: 'text-accent-foreground',
  success: 'text-success',
  warning: 'text-warning',
  error: 'text-destructive',
};

export const NOTIFICATION_TYPE_VARIANTS = {
  info: 'secondary',
  success: 'success',
  warning: 'warning',
  error: 'destructive',
};

export const NOTIFICATION_PRIORITY_COLORS = {
  low: 'bg-accent-foreground',
  medium: 'bg-success',
  high: 'bg-warning',
  urgent: 'bg-destructive',
};

export const AUTOMATION_HISTORIES_CURSOR_SESSION_KEY =
  'automation-histories-cursor';
