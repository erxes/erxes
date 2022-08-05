import { Document, Schema } from 'mongoose';
import { MESSAGE_TYPES } from './constants';
import { field } from './utils';

interface IEngageDataRules {
  kind: string;
  text: string;
  condition: string;
  value?: string;
}

interface IEngageDataRulesDocument extends IEngageDataRules, Document {}

export interface IEngageData {
  messageId: string;
  brandId: string;
  content: string;
  fromUserId: string;
  kind: string;
  sentAs: string;
  rules?: IEngageDataRules[];
}

interface IEngageDataDocument extends IEngageData, Document {
  rules?: IEngageDataRulesDocument[];
}

export interface IMessage {
  content?: string;
  createdAt?: Date;
  attachments?: any;
  mentionedUserIds?: string[];
  conversationId: string;
  internal?: boolean;
  customerId?: string;
  visitorId?: string;
  userId?: string;
  fromBot?: boolean;
  isCustomerRead?: boolean;
  formWidgetData?: any;
  botData?: any;
  messengerAppData?: any;
  engageData?: IEngageData;
  contentType?: string;
  bookingWidgetData?: any;
}

export interface IResolveAllConversationParam {
  status: string;
  closedAt: Date;
  closedUserId: string;
}

export interface IMessageDocument extends IMessage, Document {
  _id: string;
  engageData?: IEngageDataDocument;
  createdAt: Date;
}

const attachmentSchema = new Schema(
  {
    url: field({ type: String }),
    name: field({ type: String }),
    size: field({ type: Number }),
    type: field({ type: String })
  },
  { _id: false }
);

const engageDataRuleSchema = new Schema(
  {
    kind: field({ type: String }),
    text: field({ type: String }),
    condition: field({ type: String }),
    value: field({ type: String, optional: true })
  },
  { _id: false }
);

const engageDataSchema = new Schema(
  {
    engageKind: field({ type: String }),
    messageId: field({ type: String }),
    brandId: field({ type: String }),
    content: field({ type: String }),
    fromUserId: field({ type: String }),
    kind: field({ type: String }),
    sentAs: field({ type: String }),
    rules: field({ type: [engageDataRuleSchema], optional: true })
  },
  { _id: false }
);

export const messageSchema = new Schema({
  _id: field({ pkey: true }),
  content: field({ type: String, optional: true }),
  attachments: [attachmentSchema],
  mentionedUserIds: field({ type: [String] }),
  conversationId: field({ type: String, index: true }),
  internal: field({ type: Boolean, index: true }),
  customerId: field({ type: String, index: true }),
  visitorId: field({
    type: String,
    index: true,
    label: 'unique visitor id on logger database'
  }),
  fromBot: field({ type: Boolean }),
  userId: field({ type: String, index: true }),
  createdAt: field({ type: Date, index: true }),
  isCustomerRead: field({ type: Boolean }),
  botData: field({ type: Object }),
  formWidgetData: field({ type: Object }),
  messengerAppData: field({ type: Object }),
  engageData: field({ type: engageDataSchema }),
  contentType: field({
    type: String,
    enum: MESSAGE_TYPES.ALL,
    default: MESSAGE_TYPES.TEXT
  }),
  bookingWidgetData: field({ type: Object })
});
