import { Document } from 'mongoose';

export type InstagramMessageKind =
  | 'text'
  | 'image'
  | 'video'
  | 'audio'
  | 'file'
  | 'share'
  | 'story_mention'
  | 'story_reply'
  | 'deleted'
  | 'unsupported';

export interface IInstagramMessageReaction {
  senderId: string;
  emoji?: string;
  reaction?: string;
}

export interface IInstagramMessageProviderData {
  messageId?: string;
  attachmentType?: string;
  fallbackReason?: string;
  previewText?: string;
  storyUrl?: string;
}

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
  messageKind?: InstagramMessageKind;
  providerData?: IInstagramMessageProviderData;
  replyTo?: { messageId: string };
  reactions?: IInstagramMessageReaction[];
  deliveryStatus?: 'sent' | 'delivered' | 'read' | 'deleted';
  expiresAt?: Date;
}

export interface IInstagramConversationMessageDocument
  extends IInstagramConversationMessage, Document {
  _id: string;
}
