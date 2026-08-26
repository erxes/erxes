import { TMailAttachmentDisposition } from '@/integrations/mail/@types/message';

export type TEmailDeliveryProvider = 'SES' | 'sendgrid' | 'custom';

export interface ISendMailAttachment {
  name?: string;
  url?: string;
  type?: string;
  size?: number;
  contentId?: string;
  disposition?: TMailAttachmentDisposition;
}

export interface ISendMailInput {
  messageId: string;
  from: string;
  fromName?: string;
  replyTo: string;
  to: string[];
  cc?: string[];
  bcc?: string[];
  subject: string;
  html: string;
  inReplyTo?: string;
  references?: string[];
  attachments?: ISendMailAttachment[];
}

export interface ISendMailResult {
  messageId: string;
  providerMessageId?: string;
  from: string;
  delivered: string[];
  bounced: string[];
  queued: string[];
}

export interface IMailTransportOutcome {
  providerMessageId?: string;
  delivered: string[];
  bounced: string[];
  queued: string[];
}

export interface IMailTransport {
  readonly name: string;
  readonly provider: TEmailDeliveryProvider;
  readonly domain: string;
  send(input: ISendMailInput): Promise<IMailTransportOutcome>;
}
