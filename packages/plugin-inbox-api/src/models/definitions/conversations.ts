import { Document, Schema } from 'mongoose';
import { ICustomField } from '@erxes/common-types/src/common';
import {
  CONVERSATION_OPERATOR_STATUS,
  CONVERSATION_SELECT_OPTIONS,
  CONVERSATION_STATUSES
} from './constants';
import { field } from './utils';

const customFieldSchema = new Schema(
  {
    field: field({ type: String }),
    value: field({ type: Schema.Types.Mixed }),
    stringValue: field({ type: String, optional: true }),
    numberValue: field({ type: Number, optional: true }),
    dateValue: field({ type: Date, optional: true })
  },
  { _id: false }
);

export interface IConversation {
  skillId?: string;
  operatorStatus?: string;
  content?: string;
  integrationId: string;
  customerId?: string;
  visitorId?: string;
  userId?: string;
  assignedUserId?: string;
  participatedUserIds?: string[];
  userRelevance?: string;
  readUserIds?: string[];

  createdAt?: Date;
  updatedAt?: Date;
  closedAt?: Date;
  closedUserId?: string;

  status?: string;
  messageCount?: number;
  tagIds?: string[];

  // number of total conversations
  number?: number;

  firstRespondedUserId?: string;
  firstRespondedDate?: Date;

  isCustomerRespondedLast?: boolean;
  customFieldsData?: ICustomField[];
  bookingProductId?: string;
}

// Conversation schema
export interface IConversationDocument extends IConversation, Document {
  _id: string;
  createdAt: Date;
  updatedAt: Date;
}

// Conversation schema
export const conversationSchema = new Schema({
  _id: field({ pkey: true }),
  operatorStatus: field({
    type: String,
    enum: CONVERSATION_OPERATOR_STATUS.ALL,
    label: 'Operator Status',
    selectOptions: CONVERSATION_SELECT_OPTIONS.OPERATOR_STATUS,
    optional: true
  }),
  content: field({ type: String, label: 'Content', optional: true }),
  integrationId: field({ type: String, index: true }),
  customerId: field({ type: String, index: true }),
  visitorId: field({
    type: String
  }),
  userId: field({ type: String }),
  assignedUserId: field({ type: String }),
  participatedUserIds: field({ type: [String] }),
  userRelevance: field({ type: String }),
  readUserIds: field({ type: [String] }),
  createdAt: field({ type: Date, label: 'Created at' }),
  updatedAt: field({ type: Date, label: 'Updated at', index: true }),

  closedAt: field({
    type: Date,
    label: 'Closed at',
    optional: true
  }),

  closedUserId: field({
    type: String,
    optional: true
  }),

  status: field({
    type: String,
    enum: CONVERSATION_STATUSES.ALL,
    selectOptions: CONVERSATION_SELECT_OPTIONS.STATUS,
    label: 'Status',
    index: true
  }),
  messageCount: field({ type: Number, label: 'Message count' }),
  tagIds: field({ type: [String] }),

  // number of total conversations
  number: field({ type: Number }),

  firstRespondedUserId: field({ type: String }),
  firstRespondedDate: field({ type: Date, label: 'First responded date' }),

  isCustomerRespondedLast: field({
    type: Boolean,
    label: 'Last responder is customer'
  }),

  customFieldsData: field({
    type: [customFieldSchema],
    optional: true,
    label: 'Custom fields data'
  }),

  bookingProductId: field({ type: String })
});

conversationSchema.index(
  { visitorId: 1 },
  { partialFilterExpression: { visitorId: { $exists: true } } }
);
conversationSchema.index(
  { userId: 1 },
  { partialFilterExpression: { userId: { $exists: true } } }
);
conversationSchema.index(
  { userRelevance: 1 },
  { partialFilterExpression: { userRelevance: { $exists: true } } }
);
