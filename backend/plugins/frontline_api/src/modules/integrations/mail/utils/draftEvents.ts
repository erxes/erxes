import { graphqlPubsub } from 'erxes-api-shared/utils';
import type {
  IMailDraftChangedEvent,
  IMailDraftDocument,
} from '@/integrations/mail/@types/draft';

const tenantKey = (subdomain: string) =>
  process.env.VERSION === 'saas' ? subdomain : 'os';

export const publishMailDraftChanged = async (
  subdomain: string,
  draft: IMailDraftDocument,
) => {
  const event: IMailDraftChangedEvent = {
    _id: String(draft._id),
    conversationId: draft.inboxConversationId,
    status: draft.status,
  };

  await graphqlPubsub.publish(
    `mailDraftChanged:${tenantKey(subdomain)}:${draft.inboxConversationId}`,
    { mailDraftChanged: event },
  );
};
