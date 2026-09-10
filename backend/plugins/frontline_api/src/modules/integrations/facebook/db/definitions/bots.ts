import { Document, Schema } from 'mongoose';
import { schemaWrapper } from 'erxes-api-shared/utils';

type TPersistentMenuType = 'button' | 'link' | 'human_handoff' | 'back_button';

interface IPersistentMenus {
  _id: string;
  text: string;
  type: TPersistentMenuType;
  link?: string;
}

interface IIceBreakers {
  _id: string;
  question: string;
}

interface IBotHealth {
  status: 'healthy' | 'degraded' | 'broken' | 'syncing';
  isSubscribed?: boolean;
  isProfileSynced?: boolean;
  lastSyncedAt?: Date;
  lastVerifiedAt?: Date;
  lastError?: string;
  // Public comment replies are paused until this time after Facebook answers
  // with a spam or rate-limit refusal. Persisted, not cached: a restart must
  // not resume hammering a page Facebook already told us to leave alone.
  sendBlockedUntil?: Date;
  sendBlockReason?: string;
  sendBlockCount?: number;
}

export interface IFacebookBot {
  name: string;
  accountId: string;
  uid: string;
  pageId: string;
  token: string;
  status: string;
  persistentMenus: IPersistentMenus[];
  iceBreakers?: IIceBreakers[];
  // The Get Started button's label. Its payload is unaffected, so a renamed
  // button keeps triggering the same automations.
  getStartedText?: string;
  greetText?: string;
  handoffMessage?: string;
  automationActiveMessage?: string;
  handoffPauseMinutes?: number;
  tag?: string;
  isEnabledBackBtn?: boolean;
  backButtonText?: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
  health?: IBotHealth;
}

export interface IFacebookBotDocument extends IFacebookBot, Document {
  _id: string;
}

const persistentMenuSchema = new Schema({
  _id: { type: String },
  text: { type: String },
  type: {
    type: String,
    enum: ['button', 'link', 'human_handoff', 'back_button'],
  },
  link: { type: String, optional: true },
});

const iceBreakerSchema = new Schema({
  _id: { type: String },
  question: { type: String },
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
    sendBlockedUntil: { type: Date, optional: true },
    sendBlockReason: { type: String, optional: true },
    sendBlockCount: { type: Number, default: 0 },
  },
  { _id: false },
);

export const facebookBotSchema = schemaWrapper(
  new Schema({
    name: { type: String },
    accountId: { type: String },
    uid: { type: String },
    // Every outgoing reply resolves its bot by page, and a page has one bot.
    pageId: { type: String, index: true },
    token: { type: String },
    persistentMenus: { type: [persistentMenuSchema] },
    iceBreakers: { type: [iceBreakerSchema], default: [] },
    getStartedText: { type: String, optional: true },
    greetText: { type: String, optional: true },
    handoffMessage: { type: String, optional: true },
    automationActiveMessage: { type: String, optional: true },
    handoffPauseMinutes: { type: Number, default: 10 },
    tag: { type: String, optional: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    createdBy: { type: String, required: true, index: true },
    updatedBy: { type: String, required: true, index: true },
    isEnabledBackBtn: { type: Boolean, optional: true },
    backButtonText: { type: String, optional: true },
    health: { type: healthSchema, default: () => ({}) },
  }),
);
