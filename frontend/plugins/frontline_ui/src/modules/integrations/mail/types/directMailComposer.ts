import type { z } from 'zod';
import type { FrontlineMailSendersQuery } from '~/gql/graphql';
import type { composeSchema } from '@/integrations/mail/utils/directMailComposer';

export type MailSender = NonNullable<
  NonNullable<FrontlineMailSendersQuery['mailSenders']>[number]
>;

export interface ComposeEmailTarget {
  integrationId?: string;
  customerId?: string;
  companyId?: string;
  email: string;
  emails?: string[];
}

export type ComposeValues = z.infer<typeof composeSchema>;
