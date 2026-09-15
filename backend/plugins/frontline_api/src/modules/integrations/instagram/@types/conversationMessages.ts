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
  | 'sticker'
  | 'voice'
  | 'unsupported';

export interface IInstagramMessageProviderData {
  messageId?: string;
  attachmentType?: string;
  fallbackReason?: string;
  previewText?: string;
  previewUrl?: string;
  shareType?: 'post' | 'reel';
  storyUrl?: string;
}

export interface IInstagramMessageReplyTo {
  messageId: string;
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
  replyTo?: IInstagramMessageReplyTo;
  deliveryStatus?: 'sent' | 'delivered' | 'read';
  expiresAt?: Date;
}

export interface IInstagramConversationMessageDocument
  extends IInstagramConversationMessage, Document {
  _id: string;
}
