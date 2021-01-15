import { Document, Schema } from 'mongoose';
import {
  CONVERSATION_OPERATOR_STATUS,
  CONVERSATION_STATUSES
} from './constants';
import { field } from './utils';

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
    optional: true
  }),
  content: field({ type: String, optional: true }),
  integrationId: field({ type: String, index: true }),
  customerId: field({ type: String }),
  visitorId: field({
    type: String,
    index: true,
    label: 'unique visitor id on logger database'
  }),
  userId: field({ type: String }),
  assignedUserId: field({ type: String }),
  participatedUserIds: field({ type: [String] }),
  userRelevance: field({ type: String, index: true }),
  readUserIds: field({ type: [String] }),
  createdAt: field({ type: Date, index: true }),
  updatedAt: field({ type: Date }),

  closedAt: field({
    type: Date,
    optional: true
  }),

  closedUserId: field({
    type: String,
    optional: true
  }),

  status: field({
    type: String,
    enum: CONVERSATION_STATUSES.ALL,
    index: true
  }),
  messageCount: field({ type: Number }),
  tagIds: field({ type: [String] }),

  // number of total conversations
  number: field({ type: Number }),

  firstRespondedUserId: field({ type: String }),
  firstRespondedDate: field({ type: Date }),

  isCustomerRespondedLast: field({ type: Boolean })
});
