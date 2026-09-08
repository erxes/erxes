import { Document } from 'mongoose';

export type TMailMessageType = 'INBOX' | 'SENT';

export type TMailDeliveryStatus = 'pending' | 'sent' | 'bounced' | 'failed';

export interface IMailAddress {
  name?: string;
  address: string;
}

export type TMailAttachmentDisposition = 'attachment' | 'inline';

export interface IMailAttachment {
  filename: string;
  mimeType?: string;
  type?: string;
  size?: number;
  url?: string;
  contentId?: string;
  disposition?: TMailAttachmentDisposition;
  error?: string;
}

export interface IMailMessage {
  inboxIntegrationId: string;
  inboxConversationId: string;
  messageId: string;
  subject?: string;
  body: string;
  from: IMailAddress[];
  to: IMailAddress[];
  cc: IMailAddress[];
  bcc: IMailAddress[];
  attachments?: IMailAttachment[];
  inReplyTo?: string;
  references?: string[];
  replyTag?: string;
  isAuto?: boolean;
  envelopeFrom?: string;
  senderMismatch?: boolean;
  providerMessageId?: string;
  deliveryStatus?: TMailDeliveryStatus;
  deliveryError?: string;
  deliveryRetryable?: boolean;
  bouncedRecipients?: string[];
  type: TMailMessageType;
  createdAt: Date;
}

export interface IMailMessageDocument extends IMailMessage, Document {
  _id: string;
}

export interface IMailSendArgs {
  integrationId?: string;
  conversationId?: string;
  customerId?: string;
  subject: string;
  body?: string;
  to: string[];
  cc?: string[];
  bcc?: string[];
  attachments?: {
    name?: string;
    url?: string;
    type?: string;
    size?: number;
    contentId?: string;
    disposition?: TMailAttachmentDisposition;
  }[];
  replyToMessageId?: string;
  references?: string[];
  shouldResolve?: boolean;
  shouldOpen?: boolean;
}
