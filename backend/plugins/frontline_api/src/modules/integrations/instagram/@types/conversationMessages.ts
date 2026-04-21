import { Document } from 'mongoose';

export interface IInstagramConversationMessage {
  mid: string;
  conversationId: string;
  content: string;
  // from inbox
  createdAt?: Date;
  updatedAt?: Date;
  attachments?: any;
  customerId?: string;
  visitorId?: string;
  userId?: string;
  fromBot?: boolean;
  isCustomerRead?: boolean;
  internal?: boolean;
  botId?: string;
  botData?: any;
}

export interface IInstagramConversationMessageDocument
  extends IInstagramConversationMessage, Document {
  _id: string;
}
