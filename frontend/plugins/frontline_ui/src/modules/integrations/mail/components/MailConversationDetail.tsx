import { ScrollArea } from 'erxes-ui';
import { useCallback, useEffect, useLayoutEffect, useRef } from 'react';
import { useConversationContext } from '@/inbox/conversations/conversation-detail/hooks/useConversationContext';
import { useMailSendMail } from '@/integrations/mail/hooks/useMailConversationDetail';
import { useMailThreadData } from '@/integrations/mail/hooks/useMailThreadData';
import type { MailThreadProps } from '@/integrations/mail/types/mailThread';
import { COMPOSE_EMAIL_EVENT } from '@/integrations/mail/constants/directMailComposer';
import { MailThread } from './MailThread';
import { MailDrafts } from './MailDrafts';
import { MailInternalNotes } from './MailInternalNotes';

export const MailConversationDetail = () => {
  const viewportRef = useRef<HTMLDivElement>(null);
  const paginationRef = useRef<{ height: number; top: number } | null>(null);
  const {
    _id: conversationId,
    integration,
    customerId,
    customer,
  } = useConversationContext();
  const { mailSendMail, loading: sending } = useMailSendMail();
  const {
    messages,
    internalNotes,
    notesCount,
    loadMoreNotes,
    notesLoading,
    notesError,
    refetchNotes,
    hasMore,
    loading,
    error,
    loadMore,
  } = useMailThreadData(conversationId);

  const loadEarlier = useCallback(() => {
    const viewport = viewportRef.current;
    if (!viewport || loading || error || !hasMore || paginationRef.current)
      return;
    paginationRef.current = {
      height: viewport.scrollHeight,
      top: viewport.scrollTop,
    };
    loadMore();
  }, [loading, error, hasMore, loadMore]);

  useLayoutEffect(() => {
    const viewport = viewportRef.current;
    const previous = paginationRef.current;
    if (!viewport || !previous || loading) return;
    viewport.scrollTop = previous.top + viewport.scrollHeight - previous.height;
    paginationRef.current = null;
  }, [loading, messages, error]);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (
      viewport &&
      messages.length &&
      viewport.scrollHeight <= viewport.clientHeight
    ) {
      loadEarlier();
    }
  }, [messages, loadEarlier]);

  const onSend: MailThreadProps['onSend'] = (payload, onSent, onOutcome) =>
    mailSendMail(
      {
        ...payload,
        integrationId: integration?._id ?? '',
        conversationId: conversationId ?? '',
      },
      onSent,
      onOutcome,
    );

  const startNewEmail = (email: string) => {
    window.dispatchEvent(
      new CustomEvent(COMPOSE_EMAIL_EVENT, {
        detail: {
          customerId:
            customer?.primaryEmail?.trim().toLowerCase() ===
            email.trim().toLowerCase()
              ? customerId
              : undefined,
          integrationId: integration?._id,
          email,
          emails: [email],
        },
      }),
    );
  };

  return (
    <ScrollArea.Root className="@container h-full">
      <ScrollArea.Viewport
        ref={viewportRef}
        onScroll={() => {
          if (viewportRef.current && viewportRef.current.scrollTop <= 60)
            loadEarlier();
        }}
      >
        <div className="w-[100cqw] min-w-0 space-y-3 p-4 pb-8">
          <MailThread
            conversationId={conversationId ?? ''}
            messages={messages}
            loading={loading}
            sending={sending}
            error={error?.message}
            onSend={onSend}
            onNewEmail={startNewEmail}
            beforeCompose={
              <MailDrafts conversationId={conversationId} messages={messages} />
            }
            scrollViewportRef={viewportRef}
          />
          <MailInternalNotes
            notes={internalNotes}
            totalCount={notesCount}
            onLoadMore={loadMoreNotes}
            loading={notesLoading}
            error={notesError?.message}
            onRetry={refetchNotes}
          />
        </div>
      </ScrollArea.Viewport>
      <ScrollArea.Bar />
    </ScrollArea.Root>
  );
};
