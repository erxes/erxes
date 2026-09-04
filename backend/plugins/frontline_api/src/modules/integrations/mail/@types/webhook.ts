import { IInboundAttachment } from '@/integrations/mail/utils/attachments';

export interface IInboundAddress {
  name?: string;
  address?: string;
}

export interface IInboundMailPayload {
  probe?: boolean;
  to: string;
  messageId: string;
  inReplyTo?: string;
  references?: string[];
  from?: IInboundAddress;
  envelopeFrom?: string;
  recipients?: IInboundAddress[];
  cc?: IInboundAddress[];
  bcc?: IInboundAddress[];
  subject?: string;
  html?: string;
  receivedAt?: string;
  headers?: Record<string, string>;
  attachments?: IInboundAttachment[];
}
