import {
  resolveMailReplyContext,
  TMailActionParams,
} from '@/integrations/mail/meta/automation/replyContext';
import { publishMailDraftChanged } from '@/integrations/mail/utils/draftEvents';

export const actionCreateMailDraft = async (params: TMailActionParams) => {
  const reply = await resolveMailReplyContext(params, 'Draft Email Reply');

  const draft = await params.models.MailDrafts.createDraft({
    inboxIntegrationId: reply.target.integrationId,
    inboxConversationId: reply.target.conversationId,
    sourceMessageId: reply.target._id,
    customerId: reply.target.customerId,
    to: [reply.recipient],
    subject: reply.subject,
    body: reply.body,
    replyToMessageId: reply.replyToMessageId,
    references: reply.references,
    shouldResolve: reply.shouldResolve,
    senderMismatch: Boolean(reply.target.senderMismatch),
  });

  await publishMailDraftChanged(params.subdomain, draft);

  return {
    result: {
      draftId: draft._id,
      subject: draft.subject,
      conversationId: draft.inboxConversationId,
    },
  };
};
