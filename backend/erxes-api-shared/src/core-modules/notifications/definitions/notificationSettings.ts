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
}

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
