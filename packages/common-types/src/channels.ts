import { Document } from 'mongoose';

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
