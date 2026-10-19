import type { MailConversationDraftsQuery } from '~/gql/graphql';

export type MailDraftStatus = 'pending' | 'sending' | 'sent';

export type MailDraft = NonNullable<
  NonNullable<MailConversationDraftsQuery['mailConversationDrafts']>[number]
>;

export interface MailDraftEdit {
  subject?: string;
  body: string;
}
