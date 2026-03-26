import { Document, Schema } from 'mongoose';
import { schemaWrapper } from 'erxes-api-shared/utils';

interface IPersistentMenus {
  _id: string;
  text: string;
  type: string;
  link?: string;
}

interface IBotHealth {
  status: 'healthy' | 'degraded' | 'broken' | 'syncing';
  isSubscribed?: boolean;
  isProfileSynced?: boolean;
  lastSyncedAt?: Date;
  lastVerifiedAt?: Date;
  lastError?: string;
}

export interface IFacebookBot {
  name: string;
  accountId: string;
  uid: string;
  pageId: string;
  token: string;
  status: string;
  persistentMenus: IPersistentMenus[];
  greetText?: string;
  tag?: string;
  isEnabledBackBtn?: boolean;
  backButtonText?: string;
  health?: IBotHealth;
}

export interface IFacebookBotDocument extends IFacebookBot, Document {
  _id: string;
}

const persistentMenuSchema = new Schema({
  _id: { type: String },
  text: { type: String },
  type: { type: String },
  link: { type: String, optional: true },
});

const healthSchema = new Schema(
  {
    status: {
      type: String,
      enum: ['healthy', 'degraded', 'broken', 'syncing'],
      default: 'syncing',
      index: true,
    },
    isSubscribed: { type: Boolean, default: false },
    isProfileSynced: { type: Boolean, default: false },
    lastSyncedAt: { type: Date, optional: true },
    lastVerifiedAt: { type: Date, optional: true },
    lastError: { type: String, optional: true },
  },
  { _id: false },
);

export const facebookBotSchema = schemaWrapper(
  new Schema({
    name: { type: String },
    accountId: { type: String },
    uid: { type: String },
    pageId: { type: String },
    token: { type: String },
    persistentMenus: { type: [persistentMenuSchema] },
    greetText: { type: String, optional: true },
    tag: { type: String, optional: true },
    createdAt: { type: Date, default: Date.now },
    isEnabledBackBtn: { type: Boolean, optional: true },
    backButtonText: { type: String, optional: true },
    health: { type: healthSchema, default: () => ({}) },
  }),
);
