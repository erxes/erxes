import { IUser } from '@erxes/ui/src/auth/types';
import { ICustomer } from '@erxes/ui/src/customers/types';
import { IIntegration } from '@erxes/ui-settings/src/integrations/types';
import { ITag } from '@erxes/ui/src/tags/types';

export interface IEmail {
  name?: string;
  email: string;
}

export interface IMailAttachment {
  id?: string;
  filename?: string;
  content_type?: string;
  mimeType?: string;
  size: number;
  attachmentId: string;
  data?: string;
}

export interface IConversation {
  _id: string;
  content?: string;
  integrationId: string;
  customerId?: string;
  userId?: string;
  assignedUserId?: string;
  participatedUserIds?: string[];
  readUserIds?: string[];
  createdAt: Date;

  closedAt?: Date;
  closedUserId?: string;

  status?: string;
  messageCount?: number;
  tagIds?: string[];

  // number of total conversations
  number?: number;

  integration: IIntegration;
  customer: ICustomer;
  assignedUser: IUser;
  participatedUsers?: IUser[];
  tags: ITag[];
  updatedAt: Date;
  idleTime: number;
  facebookPost?: IFacebookPost;
  callProAudio?: string;
  videoCallData?: IVideoCallData;

  isFacebookTaggedMessage?: boolean;

  customFieldsData?: {
    [key: string]: any;
  };
}

export interface IVideoCallData {
  url: string;
  name?: string;
  status?: string;
  recordingLinks?: string[];
}

interface IEngageDataRules {
  kind: string;
  text: string;
  condition: string;
  value?: string;
}

export interface IFacebookPost {
  postId: string;
  recipientId: string;
  senderId: string;
  content: string;
  erxesApiId?: string;
  attachments: string[];
  timestamp: Date;
  permalink_url: string;
}

export interface IEngageData {
  messageId: string;
  brandId: string;
  content: string;
  fromUserId: string;
  kind: string;
  sentAs: string;
  rules?: IEngageDataRules[];
}

export interface IMail {
  integrationEmail: string;
  messageId?: string;
  replyTo?: string;
  inReplyTo?: string;
  headerId?: string;
  accountId?: string;
  replyToMessageId?: string;
  from: IEmail[];
  to: IEmail[];
  cc?: IEmail[];
  bcc?: IEmail[];
  reply?: string;
  references?: string;
  threadId?: string;
  subject?: string;
  body?: string;
  attachments?: IMailAttachment[];
}

export interface IMessage {
  content: string;
  videoCallData?: IVideoCallData;
  attachments?: any;
  mentionedUserIds?: string[];
  conversationId: string;
  internal?: boolean;
  fromBot?: boolean;
  contentType?: string;
  customerId?: string;
  userId?: string;
  isCustomerRead?: boolean;
  formWidgetData?: any;
  messengerAppData?: any;
  botData?: any;
  engageData?: IEngageData;
  mailData?: IMail;

  _id: string;
  user?: IUser;
  customer?: ICustomer;
  createdAt: Date;
  updatedAt: Date;
  bookingWidgetData?: any;
}
