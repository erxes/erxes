import { Document, Schema } from 'mongoose';
import { IRule, ruleSchema } from './common';
import { MESSENGER_KINDS, METHODS, SENT_AS_CHOICES } from './constants';
import { field, schemaWrapper } from './utils';

export interface IScheduleDate {
  type?: string;
  month?: string | number;
  day?: string | number;
  time?: string;
}

interface IScheduleDateDocument extends IScheduleDate, Document {}

export interface IEmail {
  attachments?: any;
  subject?: string;
  content?: string;
  templateId?: string;
}

export interface IEmailDocument extends IEmail, Document {}

export interface IMessenger {
  brandId?: string;
  kind?: string;
  sentAs?: string;
  content?: string;
  rules?: IRule[];
}

interface IMessengerDocument extends IMessenger, Document {}

export interface IEngageMessage {
  kind?: string;
  segmentIds?: string[];
  brandIds?: string[];
  tagIds?: string[];
  customerIds?: string[];
  title?: string;
  fromUserId?: string;
  method?: string;
  isDraft?: boolean;
  isLive?: boolean;
  stopDate?: Date;
  messengerReceivedCustomerIds?: string[];
  email?: IEmail;
  scheduleDate?: IScheduleDate;
  messenger?: IMessenger;
}

export interface IEngageMessageDocument extends IEngageMessage, Document {
  scheduleDate?: IScheduleDateDocument;

  email?: IEmailDocument;
  messenger?: IMessengerDocument;

  _id: string;
}

// Mongoose schemas =======================
const scheduleDateSchema = new Schema(
  {
    type: field({ type: String, optional: true }),
    month: field({ type: String, optional: true }),
    day: field({ type: String, optional: true }),
    time: field({ type: Date, optional: true }),
  },
  { _id: false },
);

const emailSchema = new Schema(
  {
    attachments: field({ type: Object, optional: true }),
    subject: field({ type: String }),
    content: field({ type: String }),
    templateId: field({ type: String, optional: true }),
  },
  { _id: false },
);

const messengerSchema = new Schema(
  {
    brandId: field({ type: String }),
    kind: field({
      type: String,
      enum: MESSENGER_KINDS.ALL,
    }),
    sentAs: field({
      type: String,
      enum: SENT_AS_CHOICES.ALL,
    }),
    content: field({ type: String }),
    rules: field({ type: [ruleSchema] }),
  },
  { _id: false },
);

export const engageMessageSchema = schemaWrapper(
  new Schema({
    _id: field({ pkey: true }),
    kind: field({ type: String }),
    segmentId: field({ type: String, optional: true }), // TODO Remove
    segmentIds: field({
      type: [String],
      optional: true,
    }),
    brandIds: field({
      type: [String],
      optional: true,
    }),
    customerIds: field({ type: [String] }),
    title: field({ type: String }),
    fromUserId: field({ type: String }),
    method: field({
      type: String,
      enum: METHODS.ALL,
    }),
    isDraft: field({ type: Boolean }),
    isLive: field({ type: Boolean }),
    stopDate: field({ type: Date }),
    createdDate: field({ type: Date }),
    tagIds: field({ type: [String], optional: true }),
    messengerReceivedCustomerIds: field({ type: [String] }),

    email: field({ type: emailSchema }),
    scheduleDate: field({ type: scheduleDateSchema }),
    messenger: field({ type: messengerSchema }),
  }),
);
