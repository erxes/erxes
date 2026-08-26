import { Document } from 'mongoose';
import { IAttachment } from 'erxes-api-shared/core-types';

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
  attachments?: IAttachment[];
  mentionedUserIds?: string[];
  conversationId: string;
  internal?: boolean;
  customerId?: string;
  visitorId?: string;
  userId?: string;
  fromBot?: boolean;
  getStarted?: boolean;
  isCustomerRead?: boolean;
  formWidgetData?: unknown;
  botData?: unknown;
  messengerAppData?: unknown;
  extraData?: Record<string, unknown>;
  replyToMessageId?: string;
  pinnedByIds?: string[];
  editedAt?: Date;
  deletedAt?: Date;
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
  attachments?: IAttachment[];
  userId?: string;
  extraInfo?: unknown;
  responseTemplateId?: string;
  poll?: {
    question: string;
    options: string[];
    duration?: number;
    allowMultiselect?: boolean;
  };
  replyToMessageId?: string;
}
