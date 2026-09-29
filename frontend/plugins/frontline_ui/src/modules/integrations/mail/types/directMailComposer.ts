import type { z } from 'zod';
import type { composeSchema } from '@/integrations/mail/utils/directMailComposer';

export interface MailSender {
  integrationId: string;
  name: string;
  address: string;
}

export interface ComposeEmailTarget {
  customerId?: string;
  companyId?: string;
  email: string;
  emails?: string[];
}

export type ComposeValues = z.infer<typeof composeSchema>;
