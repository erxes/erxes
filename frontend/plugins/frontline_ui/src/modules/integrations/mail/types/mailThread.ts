import type { MailDeliveryStatus } from '@/integrations/mail/hooks/useMailConversationDetail';

export interface MailComposePayload {
  subject: string;
  body: string;
  to: string[];
  cc?: string[];
  bcc?: string[];
  replyToMessageId?: string;
  references?: string[];
}

export interface EmailAddress {
  name?: string;
  email?: string;
}

export interface Attachment {
  filename?: string;
  mimeType?: string;
  size?: number;
  url?: string;
  contentId?: string;
  disposition?: 'attachment' | 'inline';
  error?: string;
}

export interface MailData {
  messageId?: string;
  references?: string[];
  type?: 'INBOX' | 'SENT';
  from?: EmailAddress[];
  to?: EmailAddress[];
  cc?: EmailAddress[];
  bcc?: EmailAddress[];
  subject?: string;
  body?: string;
  newContent?: string;
  replies?: string;
  attachments?: Attachment[];
  deliveryStatus?: MailDeliveryStatus;
  deliveryError?: string;
  deliveryRetryable?: boolean;
  bouncedRecipients?: string[];
  envelopeFrom?: string;
  senderMismatch?: boolean;
}

export interface MailMessage {
  _id: string;
  createdAt: string;
  mailData: MailData;
}

export type ComposeMode = 'reply' | 'replyAll' | 'forward' | 'new';
