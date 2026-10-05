export type MailDeliveryStatus = 'pending' | 'sent' | 'bounced' | 'failed';

export interface MailAttachmentInput {
  name?: string;
  url?: string;
  type?: string;
  size?: number;
  contentId?: string;
  disposition?: 'attachment' | 'inline';
}

export interface MailSendMailVariables {
  integrationId?: string;
  conversationId?: string;
  subject: string;
  body?: string;
  to: string[];
  cc?: string[];
  bcc?: string[];
  shouldResolve?: boolean;
  shouldOpen?: boolean;
  replyToMessageId?: string;
  references?: string[];
  attachments?: MailAttachmentInput[];
  customerId?: string;
}

export interface MailDeliveryOutcome {
  _id: string;
  deliveryStatus?: MailDeliveryStatus;
  deliveryError?: string;
  bouncedRecipients?: string[];
}
