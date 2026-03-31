export type SetAtom<Args extends unknown[], Result> = (...args: Args) => Result;

export enum MyInboxHotkeyScope {
  MainPage = 'my-inbox-main-filter',
  NotificationsAbjustments = 'my-inbox-main-abjustments',
  NotificationsContainer = 'my-inbox-notifications-container',
}

export enum NotificationsPaths {
  MainPage = '/my-inbox',
}

export type PluginsNotificationConfigEvents = {
  name: string;
  title: string;
  description: string;
};

export type PluginsNotificationConfigModules = {
  name: string;
  description: string;
  icon: string;
  events: PluginsNotificationConfigEvents[];
};

export type PluginsNotificationConfig = {
  pluginName: string;
  modules: PluginsNotificationConfigModules[];
};

export interface NotificationChannelMetadata {
  [key: string]: unknown;
}

export interface NotificationChannel {
  enabled: boolean;
  metadata?: NotificationChannelMetadata;
}

export interface NotificationEvent {
  enabled: boolean;
  channels: string[];
}

export interface NotificationSettings {
  _id: string;
  userId: string;
  channels: Map<string, NotificationChannel>;
  events: Map<string, NotificationEvent>;
  createdAt: Date;
  updatedAt: Date;
}
