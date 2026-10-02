import { IAttachment } from 'erxes-ui';
import type { MailDeliveryStatus } from '@/integrations/mail/types/mailDelivery';
export interface IActivityFormField {
  label: string;
  value: unknown;
}

export interface IActivity {
  _id: string;
  module: string;
  action: string;
  contentId: string;
  metadata: {
    newValue: string;
    previousValue?: string;
    conversationId?: string;
    ticketId?: string;
    formId?: string;
    formTitle?: string;
    submissions?: IActivityFormField[];
  };
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}
export interface INote {
  _id: string;
  content: string;
  createdAt: string;
  createdBy: string;
  contentId: string;
  mentions: string[];
  attachments?: IAttachment[];
  isInternal?: boolean;
  mailMessageId?: string | null;
  mailDelivery?: ITicketNoteMailDelivery | null;
  unsavedAttachments?: ITicketNoteUnsavedAttachment[] | null;
  updatedAt: string;
}

export interface ITicketNoteUnsavedAttachment {
  name?: string | null;
  url?: string | null;
  type?: string | null;
  size?: number | null;
  error?: string | null;
  expiresAt?: string | null;
}

export interface ITicketNoteMailDelivery {
  status?: MailDeliveryStatus | null;
  error?: string | null;
  to?: string[] | null;
  bouncedRecipients?: string[] | null;
  retryable?: boolean | null;
  canRetry?: boolean | null;
}

export type TNoteKind =
  | 'internal'
  | 'emailReceived'
  | 'portalReceived'
  | 'emailSent'
  | 'customerVisible';

export interface ITicketReplyTarget {
  from: string;
  to?: string | null;
}

export interface INoteTemplateSuggestion {
  _id: string;
  name: string;
  content: string;
  channelId?: string;
  updatedAt?: string;
  preview?: string;
}

export interface INoteAttachment {
  name: string;
  type: string;
  size: number;
  url?: string;
  data?: string;
}
