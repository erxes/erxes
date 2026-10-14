import type { ChannelScope } from '@/channels/types';
import type { composeSchema } from '@/integrations/mail/composer/utils/directMailComposer';
import type { MailAttachmentInput } from '@/integrations/mail/types/mailDelivery';
import type { z } from 'zod';

export interface MailSender {
  channelScope: ChannelScope;
  integrationId: string;
  name: string;
  address: string;
}

export interface ComposeEmailTarget {
  integrationId?: string;
  customerId?: string;
  companyId?: string;
  email?: string;
  emails?: string[];
}

export type ComposeValues = z.infer<typeof composeSchema>;

export interface MailRecipientContact {
  _id: string;
  firstName?: string;
  lastName?: string;
  primaryEmail?: string;
  emails?: string[];
  emailValidationStatus?: string;
}

export interface MailRecipientsResult {
  customers: {
    list: MailRecipientContact[];
    pageInfo: { endCursor?: string; hasNextPage: boolean };
  };
}

export type ComposerAttachment = MailAttachmentInput & { id: string };
