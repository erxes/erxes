import { Document, Schema } from 'mongoose';

// User notification settings (individual user overrides)
export interface IUserNotificationSettingsDocument extends Document {
  _id: string;
  userId: string;

  // Global notification controls
  inAppNotificationsDisabled: boolean; // all in-app notifications
  emailNotificationsDisabled: boolean; // all email notifications

  // Plugin-level controls
  plugins: {
    [pluginName: string]: {
      inAppDisabled: boolean;
      emailDisabled: boolean;
      types: {
        [notifTypeAction: string]: {
          inAppDisabled: boolean;
          emailDisabled: boolean;
        };
      };
    };
  };

  // Metadata
  createdAt: Date;
  updatedAt: Date;
}

const userNotifTypeSettingsScheam = new Schema(
  {
    inAppDisabled: { type: Boolean },
    emailDisabled: { type: Boolean },
  },
  { _id: false },
);

const userPluginSettingsSchema = new Schema(
  {
    enabled: { type: Boolean }, // disable entire plugin notifications
    inAppDisabled: { type: Boolean },
    emailDisabled: { type: Boolean },
    types: {
      type: Map,
      of: userNotifTypeSettingsScheam,
      default: {},
    },
  },
  { _id: false },
);

export const userNotificationSettingsSchema = new Schema({
  userId: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },

  inAppNotificationsDisabled: {
    type: Boolean,
    default: false,
  },

  emailNotificationsDisabled: {
    type: Boolean,
    default: false,
  },

  plugins: {
    type: Map,
    of: userPluginSettingsSchema,
    default: {},
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },

  updatedAt: {
    type: Date,
    default: Date.now,
  },
});
