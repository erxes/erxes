import {
  IconAlertSquareRounded,
  IconInfoSquareRounded,
  IconSquareRoundedCheck,
  IconSquareRoundedX,
} from '@tabler/icons-react';
import type { BadgeProps } from 'erxes-ui';
import type { TNotificationPriority, TNotificationType } from 'ui-modules';
import type { NotificationPriorityOption } from '@/notification/types/notifications';
import type { NotificationFilterQueryState } from '@/notification/types/notificationFilters';

export const NOTIFICATION_FILTER_QUERY_KEYS: (keyof NotificationFilterQueryState)[] =
  [
    'notificationStatus',
    'notificationType',
    'notificationPriority',
    'notificationCreatedAt',
    'notificationOrderBy',
    'notificationFromUserId',
    'notificationModule',
    'notificationPlugin',
  ];

export const NOTIFICATION_TYPE_ICONS = {
  info: IconInfoSquareRounded,
  success: IconSquareRoundedCheck,
  warning: IconAlertSquareRounded,
  error: IconSquareRoundedX,
};

export const NOTIFICATION_TYPE_COLORS: Record<TNotificationType, string> = {
  info: 'text-info',
  success: 'text-success',
  warning: 'text-warning',
  error: 'text-destructive',
};

export const NOTIFICATION_APP_COLORS: Record<string, string> = {
  core: 'bg-primary/10 text-primary',
  frontline: 'bg-info/10 text-info',
  sales: 'bg-success/10 text-success',
  operation: 'bg-warning/10 text-warning',
};

export const NOTIFICATION_PRIORITY_VARIANTS: Record<
  TNotificationPriority,
  BadgeProps['variant']
> = {
  low: 'success',
  medium: 'info',
  high: 'warning',
  urgent: 'destructive',
};

export const NOTIFICATION_TYPE_VARIANTS = {
  info: 'secondary',
  success: 'success',
  warning: 'warning',
  error: 'destructive',
};

export const NOTIFICATION_PRIORITIES: NotificationPriorityOption[] = [
  {
    value: 'low',
    label: 'Minor',
    translationKey: 'minor',
    color: 'text-success',
  },
  {
    value: 'medium',
    label: 'Medium',
    translationKey: 'medium',
    color: 'text-info',
  },
  {
    value: 'high',
    label: 'High',
    translationKey: 'high',
    color: 'text-warning',
  },
  {
    value: 'urgent',
    label: 'Critical',
    translationKey: 'critical',
    color: 'text-destructive',
  },
];

export const AUTOMATION_HISTORIES_CURSOR_SESSION_KEY =
  'automation-histories-cursor';
