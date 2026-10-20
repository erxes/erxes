import { parseDateRangeFromString, useNonNullMultiQueryState } from 'erxes-ui';
import {
  TNotificationOrderBy,
  TNotificationPriority,
  TNotificationStatus,
  TNotificationType,
} from 'ui-modules';

interface NotificationFilterVariables {
  status: 'READ' | 'UNREAD' | 'ALL';
  priority: string | undefined;
  type: string | undefined;
  fromDate: Date | undefined;
  endDate: Date | undefined;
  orderBy?: Record<string, 1 | -1>;
  fromUserId: string | undefined;
  module: string | undefined;
}

export const useNotificationFilters = (): NotificationFilterVariables => {
  const {
    notificationStatus: status,
    notificationPriority: priority,
    notificationType: type,
    notificationCreatedAt: createdAt,
    notificationOrderBy: orderBy,
    notificationFromUserId: fromUserId,
    notificationModule: module,
  } = useNonNullMultiQueryState<{
    notificationStatus: TNotificationStatus;
    notificationPriority: TNotificationPriority;
    notificationType: TNotificationType;
    notificationCreatedAt: string;
    notificationOrderBy: TNotificationOrderBy;
    notificationFromUserId: string;
    notificationModule: string;
  }>([
    'notificationStatus',
    'notificationType',
    'notificationPriority',
    'notificationCreatedAt',
    'notificationOrderBy',
    'notificationFromUserId',
    'notificationModule',
  ]);

  const orderByFilter = (): Record<string, 1 | -1> => {
    if (orderBy === 'old') {
      return { createdAt: 1 };
    } else if (orderBy === 'priority') {
      return { priority: -1 };
    }
    if (orderBy === 'readAt') return { readAt: -1 };
    return {};
  };

  const orderByValue = orderByFilter();

  return {
    status: status === 'read' ? 'READ' : status === 'all' ? 'ALL' : 'UNREAD',
    priority: priority?.toUpperCase(),
    type: type?.toUpperCase(),
    fromDate: parseDateRangeFromString(createdAt)?.from,
    endDate: parseDateRangeFromString(createdAt)?.to,
    ...(Object.keys(orderByValue).length > 0 && { orderBy: orderByValue }),
    fromUserId: fromUserId ?? undefined,
    module: module ?? undefined,
  };
};
