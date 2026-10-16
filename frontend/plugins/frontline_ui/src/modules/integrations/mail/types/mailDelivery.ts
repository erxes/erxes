import type { MailSendMailMutation } from '~/gql/graphql';

export type MailDeliveryStatus = 'pending' | 'sent' | 'bounced' | 'failed';

const MAIL_DELIVERY_STATUSES: MailDeliveryStatus[] = [
  'pending',
  'sent',
  'bounced',
  'failed',
];

/** The schema types delivery status as a string; only known statuses get a badge. */
export const toMailDeliveryStatus = (
  value?: string | null,
): MailDeliveryStatus | undefined =>
  MAIL_DELIVERY_STATUSES.find((status) => status === value);

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

export type MailDeliveryOutcome = NonNullable<
  MailSendMailMutation['mailSendMail']
>;
