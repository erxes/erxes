import { Schema } from 'mongoose';

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
  mutedChannels?: string[];
}

// what an event can reach a user on besides their inbox
export const NOTIFICATION_CHANNELS = ['email', 'mobile'] as const;

export type TNotificationChannel = (typeof NOTIFICATION_CHANNELS)[number];

export interface INotificationEventConfig {
  name: string;
  title: string;
  description?: string;
  // used until the user saves a choice for the event; absent means off
  defaultChannels?: readonly TNotificationChannel[];
}

export interface INotificationModuleConfig {
  name: string;
  description: string;
  icon: string;
  events: readonly INotificationEventConfig[];
}

// a plugin's `notifications` meta
export interface INotificationsConfig {
  plugin: string;
  modules: readonly INotificationModuleConfig[];
}

// `<plugin>:<module>:<event>` for every event a meta declared `as const`
export type TNotificationEventKey<T extends INotificationsConfig> = {
  [M in T['modules'][number] as M['name']]: `${T['plugin']}:${M['name']}:${M['events'][number]['name']}`;
}[T['modules'][number]['name']];

export interface NotificationSettings {
  userId: string;
  channels: Map<string, NotificationChannel>;
  events: Map<string, NotificationEvent>;
  createdAt: Date;
  updatedAt: Date;
}

const notificationChannelSchema = new Schema(
  {
    enabled: { type: Boolean, default: false },
    metadata: Schema.Types.Mixed,
  },
  { _id: false },
);

const notifcationEventSchema = new Schema(
  {
    enabled: { type: Boolean, default: false },
    channels: { type: [String], default: [] },
    mutedChannels: { type: [String], default: [] },
  },
  {
    _id: false,
  },
);

export const notificationSettingsSchema = new Schema(
  {
    userId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    channels: {
      type: Map,
      of: notificationChannelSchema,
      default: {},
    },

    events: {
      type: Map,
      of: notifcationEventSchema,
      default: {},
    },
  },
  {
    timestamps: true,
  },
);
