import { ScrollArea } from 'erxes-ui';
import { useConversationContext } from '@/inbox/conversations/conversation-detail/hooks/useConversationContext';
import { useMailSendMail } from '@/integrations/mail/hooks/useMailConversationDetail';
import { useMailThreadData } from '@/integrations/mail/hooks/useMailThreadData';
import type { MailComposePayload } from '@/integrations/mail/types/mailThread';
import { COMPOSE_EMAIL_EVENT } from '@/integrations/mail/utils/directMailComposer';
import { MailThread } from './MailThread';
import { MailDrafts } from './MailDrafts';
import { MailInternalNotes } from './MailInternalNotes';

export const MailConversationDetail = () => {
  const {
    _id: conversationId,
    integration,
    customerId,
  } = useConversationContext();
  const { mailSendMail, loading: sending } = useMailSendMail();
  const { messages, internalNotes, hasMore, loading, error, loadMore } =
    useMailThreadData(conversationId);

  const onSend = (payload: MailComposePayload, onSent: () => void) =>
    mailSendMail(
      {
        ...payload,
        integrationId: integration?._id ?? '',
        conversationId: conversationId ?? '',
      },
      onSent,
    );

  const startNewEmail = (email: string) => {
    if (!customerId) return;

    window.dispatchEvent(
      new CustomEvent(COMPOSE_EMAIL_EVENT, {
        detail: { customerId, email, emails: [email] },
      }),
    );
  };

  return (
    <ScrollArea className="h-full">
      <div className="space-y-3 p-4 pb-8">
        <MailThread
          messages={messages}
          hasMore={hasMore}
          loading={loading}
          sending={sending}
          error={error?.message}
          onLoadMore={loadMore}
          onSend={onSend}
          onNewEmail={customerId ? startNewEmail : undefined}
          beforeCompose={
            <MailDrafts conversationId={conversationId} messages={messages} />
          }
        />
        <MailInternalNotes notes={internalNotes} />
      </div>
    </ScrollArea>
  );
};
