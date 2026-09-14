import { Document } from 'mongoose';

interface IEngageDataRules {
  kind: string;
  text: string;
  condition: string;
  value?: string;
}

interface IEngageDataRulesDocument extends IEngageDataRules, Document {}

export interface IEngageData {
  messageId: string;
  content: string;
  fromUserId: string;
  kind: string;
  sentAs: string;
  rules?: IEngageDataRules[];
}

interface IEngageDataDocument extends IEngageData, Document {
  rules?: IEngageDataRulesDocument[];
}

export interface IMessage {
  content?: string;
  createdAt?: Date;
  attachments?: any;
  mentionedUserIds?: string[];
  conversationId: string;
  internal?: boolean;
  customerId?: string;
  visitorId?: string;
  userId?: string;
  fromBot?: boolean;
  getStarted?: boolean;
  isCustomerRead?: boolean;
  formWidgetData?: any;
  botData?: any;
  messengerAppData?: any;
  extraData?: Record<string, unknown>;
  messageKind?: string;
  providerData?: {
    messageId?: string;
    attachmentType?: string;
    fallbackReason?: string;
    previewText?: string;
    storyUrl?: string;
  };
  replyTo?: {
    messageId: string;
    content?: string;
    authorName?: string;
  };
  reactions?: Array<{
    senderId: string;
    emoji?: string;
    reaction?: string;
  }>;
  deliveryStatus?: string;
  expiresAt?: Date;
  engageData?: IEngageData;
  contentType?: string;
  botId?: string;
  responseTemplateId?: string;
}

export interface IResolveAllConversationParam {
  status: string;
  closedAt: Date;
  closedUserId: string;
}

export interface IMessageDocument extends IMessage, Document {
  _id: string;
  engageData?: IEngageDataDocument;
  createdAt: Date;
}

export interface IConversationMessageAdd {
  conversationId: string;
  content: string;
  mentionedUserIds?: string[];
  internal?: boolean;
  attachments?: any;
  userId?: string;
  extraInfo?: any;
  responseTemplateId?: string;
  poll?: {
    question: string;
    options: string[];
    duration?: number;
    allowMultiselect?: boolean;
  };
  replyToMessageId?: string;
}
