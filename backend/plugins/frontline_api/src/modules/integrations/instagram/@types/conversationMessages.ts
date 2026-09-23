import { Document } from 'mongoose';
import type {
  IMessageProviderData,
  IMessageReaction,
  IMessageReplyTo,
  MessageKind,
} from '@/inbox/@types/conversationMessages';

export type InstagramMessageKind = Exclude<MessageKind, 'forwarded'>;

export type IInstagramMessageProviderData = IMessageProviderData;

export type IInstagramMessageReplyTo = Pick<IMessageReplyTo, 'messageId'>;

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
  extraData?: Record<string, unknown>;
  messageKind?: InstagramMessageKind;
  providerData?: IInstagramMessageProviderData;
  replyTo?: IInstagramMessageReplyTo;
  reactions?: IMessageReaction[];
  deliveryStatus?: 'sent' | 'delivered' | 'read' | 'deleted';
  expiresAt?: Date;
}

export interface IInstagramConversationMessageDocument
  extends IInstagramConversationMessage,
    Document {
  _id: string;
}
