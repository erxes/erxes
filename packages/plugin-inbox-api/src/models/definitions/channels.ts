import { Document, Schema } from 'mongoose';
import { field, schemaHooksWrapper } from './utils';

export interface IChannel {
  name?: string;
  description?: string;
  integrationIds?: string[];
  memberIds?: string[];
  userId?: string;
  conversationCount?: number;
  openConversationCount?: number;
}

export interface IChannelDocument extends IChannel, Document {
  _id: string;
  createdAt: Date;
}

export const channelSchema = schemaHooksWrapper(
  new Schema({
    _id: field({ pkey: true }),
    createdAt: field({ type: Date, label: 'Created at' }),
    name: field({ type: String, label: 'Name' }),
    description: field({
      type: String,
      optional: true,
      label: 'Description'
    }),
    integrationIds: field({ type: [String], label: 'Integrations' }),
    memberIds: field({ type: [String], label: 'Members' }),
    userId: field({ type: String, label: 'Created by' }),
    conversationCount: field({
      type: Number,
      default: 0,
      label: 'Conversation count'
    }),
    openConversationCount: field({
      type: Number,
      default: 0,
      label: 'Open conversation count'
    })
  }),
  'erxes_channels'
);