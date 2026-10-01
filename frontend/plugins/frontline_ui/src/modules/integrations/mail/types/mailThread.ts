import type { ReactNode } from 'react';
import type { MailDeliveryStatus } from '@/integrations/mail/types/mailDelivery';

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
  providerMessageId?: string;
  inReplyTo?: string;
  references?: string[];
  type?: 'INBOX' | 'SENT';
  from?: EmailAddress[];
  to?: EmailAddress[];
  cc?: EmailAddress[];
  bcc?: EmailAddress[];
  subject?: string;
  body?: string;
  reactionEmoji?: string;
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

export interface MailReaction {
  messageId: string;
  emoji: string;
  sender: string;
  targetMessageId: string;
}

export interface MailThreadProps {
  conversationId: string;
  messages: MailMessage[];
  hasMore?: boolean;
  loading: boolean;
  sending: boolean;
  error?: string;
  onLoadMore: () => void;
  onSend: (payload: MailComposePayload, onSent: () => void) => void;
  className?: string;
  emptyLabel?: string;
  startAddress?: string;
  startSubject?: string;
  readOnly?: boolean;
  onNewEmail?: (email: string) => void;
  beforeCompose?: ReactNode;
}
