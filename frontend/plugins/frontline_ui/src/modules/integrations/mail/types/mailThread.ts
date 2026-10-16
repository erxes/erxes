import type { ReactNode, RefObject } from 'react';
import type { MailDeliveryOutcome } from '@/integrations/mail/types/mailDelivery';
import type { MailConversationDetailQuery } from '~/gql/graphql';

export interface MailComposePayload {
  subject: string;
  body: string;
  to: string[];
  cc?: string[];
  bcc?: string[];
  replyToMessageId?: string;
  references?: string[];
}

export type MailMessage = NonNullable<
  NonNullable<
    NonNullable<
      MailConversationDetailQuery['mailConversationDetail']
    >['messages']
  >[number]
>;

export type MailData = MailMessage['mailData'];

export type EmailAddress = MailData['from'][number];

export type Attachment = NonNullable<
  NonNullable<MailData['attachments']>[number]
>;

export type ComposeMode = 'reply' | 'replyAll' | 'forward' | 'new';

export interface MailReaction {
  messageId: string;
  emoji: string;
  sender: string;
  senderAddress?: string;
  isOwn: boolean;
  targetMessageId: string;
}

export interface MailThreadProps {
  conversationId: string;
  messages: MailMessage[];
  loading: boolean;
  sending: boolean;
  error?: string;
  onSend: (
    payload: MailComposePayload,
    onSent: () => void,
    onOutcome?: (outcome: MailDeliveryOutcome) => void,
  ) => void;
  className?: string;
  emptyLabel?: string;
  startAddress?: string;
  startSubject?: string;
  readOnly?: boolean;
  onNewEmail?: (email: string) => void;
  beforeCompose?: ReactNode;
  scrollViewportRef?: RefObject<HTMLDivElement>;
}
