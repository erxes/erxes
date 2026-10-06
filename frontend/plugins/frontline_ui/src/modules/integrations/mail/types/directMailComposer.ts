import type { z } from 'zod';
import type { composeSchema } from '@/integrations/mail/utils/directMailComposer';

export interface MailSender {
  integrationId: string;
  name: string;
  address: string;
}

export interface ComposeEmailTarget {
  integrationId?: string;
  customerId?: string;
  companyId?: string;
  email: string;
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
