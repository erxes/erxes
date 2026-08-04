import { Document } from 'mongoose';

export interface IFacebookConversationMessage {
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
  source?: Record<string, unknown>;
  relatedMessage?: Record<string, unknown>;
}

export interface IFacebookConversationMessageDocument
  extends IFacebookConversationMessage,
    Document {
  _id: string;
}
