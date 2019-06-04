import { Document, Schema } from 'mongoose';
import { field } from '../utils';
import { CONVERSATION_STATUSES } from './constants';

export interface IConversation {
  content?: string;
  integrationId: string;
  customerId?: string;
  userId?: string;
  assignedUserId?: string;
  participatedUserIds?: string[];
  readUserIds?: string[];

  closedAt?: Date;
  closedUserId?: string;

  status?: string;
  messageCount?: number;
  tagIds?: string[];

  // number of total conversations
  number?: number;

  firstRespondedUserId?: string;
  firstRespondedDate?: Date;
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
  content: field({ type: String }),
  integrationId: field({ type: String, index: true }),
  customerId: field({ type: String }),
  userId: field({ type: String }),
  assignedUserId: field({ type: String }),
  participatedUserIds: field({ type: [String] }),
  readUserIds: field({ type: [String] }),
  createdAt: field({ type: Date, index: true }),
  updatedAt: field({ type: Date }),

  closedAt: field({
    type: Date,
    optional: true,
  }),

  closedUserId: field({
    type: String,
    optional: true,
  }),

  status: field({
    type: String,
    enum: CONVERSATION_STATUSES.ALL,
    index: true,
  }),
  messageCount: field({ type: Number }),
  tagIds: field({ type: [String] }),

  // number of total conversations
  number: field({ type: Number }),

  firstRespondedUserId: field({ type: String }),
  firstRespondedDate: field({ type: Date }),
});
