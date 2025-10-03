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
export interface IChannelsEdit extends IChannel {
  _id: string;
}
export interface IChannelDocument extends IChannel, Document {
  createdAt: Date;
}
