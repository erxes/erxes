import { Document, Schema } from 'mongoose';

interface INotificationSettingsChannel {
  enabled: boolean;
  [key: string]: any;
}

export interface INotificationSettingsDocument extends Document {
  userId: string;
  event: string;

  channels: Record<string, INotificationSettingsChannel>;

  createdAt: Date;
  updatedAt: Date;
}

export const notificationSettingsSchema = new Schema(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },

    event: {
      type: String,
      required: true,
      index: true,
    },

    channels: { type: Schema.Types.Mixed, default: {} },
  },
  {
    timestamps: true,
  },
);

notificationSettingsSchema.index({ userId: 1, event: 1 }, { unique: true });
