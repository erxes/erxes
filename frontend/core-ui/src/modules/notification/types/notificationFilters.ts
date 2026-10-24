import type {
  TNotificationOrderBy,
  TNotificationPriority,
  TNotificationStatus,
  TNotificationType,
} from 'ui-modules';

export type NotificationFilterQueries = {
  notificationPriority: string;
  notificationType: string;
  notificationCreatedAt: string;
  notificationFromUserId: string;
  notificationModule: string;
  notificationPlugin: string;
};

export type NotificationFilterQueryState = Omit<
  NotificationFilterQueries,
  'notificationPriority' | 'notificationType'
> & {
  notificationStatus: TNotificationStatus;
  notificationPriority: TNotificationPriority;
  notificationType: TNotificationType;
  notificationOrderBy: TNotificationOrderBy;
};

export interface NotificationFilterVariables {
  status: 'READ' | 'UNREAD' | 'ALL';
  priority: string | undefined;
  type: string | undefined;
  fromDate: Date | undefined;
  endDate: Date | undefined;
  orderBy?: Record<string, 1 | -1>;
  fromUserId: string | undefined;
  module: string | undefined;
  plugin: string | undefined;
  unreadFirst: boolean;
}

export interface UseNotificationPluginFilterResult {
  selectedPlugin: string | null;
  pluginNames: string[];
  loading: boolean;
  selectPlugin: (name: string) => void;
}
