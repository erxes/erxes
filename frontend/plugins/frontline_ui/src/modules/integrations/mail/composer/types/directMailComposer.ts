import type { composeSchema } from '@/integrations/mail/composer/utils/directMailComposer';
import type { MailAttachmentInput } from '@/integrations/mail/types/mailDelivery';
import type { z } from 'zod';
import type {
  FrontlineMailSendersQuery,
  FrontlineMailVerifiedContactsQuery,
} from '~/gql/graphql';

export type MailSender = NonNullable<
  NonNullable<FrontlineMailSendersQuery['mailSenders']>[number]
>;

export interface ComposeEmailTarget {
  integrationId?: string;
  customerId?: string;
  companyId?: string;
  email?: string;
  emails?: string[];
}

export type ComposeValues = z.infer<typeof composeSchema>;

export type MailRecipientsResult = FrontlineMailVerifiedContactsQuery;

export type MailRecipientContact = NonNullable<
  NonNullable<
    NonNullable<FrontlineMailVerifiedContactsQuery['customers']>['list']
  >[number]
>;

export type ComposerAttachment = MailAttachmentInput & { id: string };
