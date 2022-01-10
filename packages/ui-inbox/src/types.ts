import { IUser } from '@erxes/ui/src/auth/types';
import { ICustomer } from '@erxes/ui/src/customers/types';

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
