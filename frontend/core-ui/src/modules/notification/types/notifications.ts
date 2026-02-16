import { IUser } from 'ui-modules';

export enum INotificationKind {
  SYSTEM = 'system',
  USER = 'user',
}

export type NotificationStatusT = 'read' | 'unread' | 'all';

export type NotificationTypeT = 'info' | 'success' | 'warning' | 'error';
export type NotificationPriorityT = 'low' | 'medium' | 'high' | 'urgent';

export type NotificationOrderByT = 'new' | 'old' | 'priority';

export type INotification = {
  _id: string;
  title: string;
  message: string;
  type: NotificationTypeT;
  fromUserId?: string;
  fromUser?: IUser;
  contentType?: string; // 'frontline:conversation', 'sales:deal', etc.
  contentTypeId?: string; // target object ID
  // Status
  isRead: boolean;
  readAt?: string;
  // Additional data
  priority: NotificationPriorityT;
  metadata?: unknown; // plugin-specific data
  action?: string;

  // Timestamps
  kind: INotificationKind;
  emailDelivery?: {
    _id: string;
    status: string;
    error?: string;
    sentAt: string;
  };
  createdAt: string;
  updatedAt?: string;
};

export type SetAtom<Args extends unknown[], Result> = (...args: Args) => Result;

export enum MyInboxHotkeyScope {
  MainPage = 'my-inbox-main-filter',
  NotificationsAbjustments = 'my-inbox-main-abjustments',
  NotificationsContainer = 'my-inbox-notifications-container',
}

export enum NotificationsPaths {
  MainPage = '/my-inbox',
}

export type PluginsNotificationConfig = {
  pluginName: string;
  modules: {
    name: string;
    description: string;
    icon: string;
    events: {
      title: string;
      name: string;
      description: string;
    }[];
  }[];
};

export type NotificationChannel = {
  isEnabled: boolean;
  [key: string]: any;
};

export type NotificationSetting = {
  _id: string;
  userId: string;
  event: string;
  channels: NotificationChannel;
  createdAt: string;
  updatedAt?: string;
};
