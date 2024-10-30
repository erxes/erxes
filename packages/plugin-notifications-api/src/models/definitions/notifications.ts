import { Document, Schema } from 'mongoose';
import { field } from './utils';

export interface INotification {
  notifType?: string;
  title?: string;
  content?: string;
  link?: string;
  contentType?: string;
  contentTypeId?: string;
  receiver?: string;
  action?: string;
}

export interface INotificationDocument extends INotification, Document {
  _id: string;
  createdUser?: string;
  receiver: string;
  date: Date;
  isRead: boolean;
}

export const notificationSchema = new Schema({
  _id: field({ pkey: true }),
  notifType: field({
    type: String
  }),
  action: field({
    type: String,
    optional: true
  }),
  title: field({ type: String }),
  link: field({ type: String }),
  content: field({ type: String }),
  createdUser: field({ type: String }),
  receiver: field({ type: String, index: true }),
  contentType: field({ type: String, index: true }),
  contentTypeId: field({ type: String, index: true }),
  date: field({
    type: Date,
    default: Date.now,
    index: true
  }),
  isRead: field({
    type: Boolean,
    default: false,
    index: true
  })
});

notificationSchema.index({
  receiver: 1,
  isRead: 1,
  title: 1,
  notifType: 1,
  contentType: 1,
  date: 1
});

interface IPluginConfig {
  type: string;
  isDisabled?: boolean;
  notifTypes?: {
    notifType: string;
    isDisabled?: boolean;
    isDisabledEmail?: boolean;
    isDisabledDesktop?: boolean;
    customHtml?: string;
  }[];
}
export interface IConfig {
  userId: string;
  isDefault?: boolean;
  isDisabled?: boolean;
  isAllowEmail?: boolean;
  isAllowedDesktop?: boolean;
  pluginsConfigs: IPluginConfig[];
}

export interface IConfigDocument extends IConfig, Document {
  _id: string;
}

const actionConfigsSchema = new Schema(
  {
    notifType: field({ type: String, label: 'Action Type' }),
    isDisabled: field({ type: Boolean, label: 'is disabled' }),
    isDisabledEmail: field({ type: Boolean }),
    isDisabledDesktop: field({ type: Boolean }),
    customHtml: field({ type: String, label: 'Custom HTML', optional: true })
  },
  { _id: false }
);

const pluginConfigsSchema = new Schema(
  {
    type: field({ type: String, label: 'Plugin Type' }),
    isDisabled: field({
      type: Boolean,
      label: 'Is disabled plugin notifications'
    }),
    notifTypes: field({ type: [actionConfigsSchema] })
  },
  { _id: false }
);

export const configSchema = new Schema({
  _id: field({ pkey: true }),
  userId: field({ type: String, label: 'User', required: true }),
  isDisabled: field({ type: Boolean }),
  isAllowEmail: field({
    type: Boolean,
    default: false,
    label: 'Is Allowed Email'
  }),
  isAllowedDesktop: field({
    type: Boolean,
    default: false,
    label: 'Is Allowed Desktop'
  }),
  pluginsConfigs: field({ type: [pluginConfigsSchema] }),

  // for default configurations
  isDefault: field({ type: Boolean, label: 'Default', optional: true })
});
