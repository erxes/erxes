import { useEffect, useRef, useState } from 'react';
import { MessageItem } from './MessageItem';
import { IMessage } from '@/inbox/types/Conversation';
import { useConversationMessages } from '@/inbox/conversation-messages/hooks/useConversationMessages';
import { useConversationTypingStatus } from '@/inbox/conversation-messages/hooks/useConversationTypingStatus';
import { TypingIndicator } from '@/inbox/conversation-messages/components/TypingIndicator';
import { ConversationMessageContext } from '@/inbox/conversations/context/ConversationMessageContext';
import { InboxMessagesContainer } from '@/inbox/components/InboxMessagesContainer';
import { useQuery } from '@apollo/client';
import { GET_CONVERSATION_PINNED_MESSAGES } from '@/inbox/conversations/conversation-detail/graphql/queries/getConversationPinnedMessages';
import { PinnedMessagesBar } from './PinnedMessagesBar';

export const ConversationMessages = ({
  conversationId,
}: {
  conversationId: string;
}) => {
  const [pendingReplyTarget, setPendingReplyTarget] = useState<string | null>(
    null,
  );
  const { data: pinnedData, refetch: refetchPinnedMessages } = useQuery<{
    conversationPinnedMessages: IMessage[];
  }>(GET_CONVERSATION_PINNED_MESSAGES, {
    variables: { conversationId },
    fetchPolicy: 'cache-and-network',
    pollInterval: 30_000,
  });
  const pinnedMessages = pinnedData?.conversationPinnedMessages || [];
  const { messages, loading, handleFetchMore, totalCount } =
    useConversationMessages({
      variables: {
        conversationId,
        limit: 10,
        skip: 0,
      },
      fetchPolicy: 'cache-and-network',
    });

  const { typingNames, clearTypist } =
    useConversationTypingStatus(conversationId);

  const lastMessage = messages?.[messages.length - 1];
  const pinnedMessageSignature = messages
    .filter((message) => message.extraData?.discordPinned)
    .map((message) => message._id)
    .sort()
    .join(':');
  const previousPinnedSignatureRef = useRef<string>();

  useEffect(() => {
    if (previousPinnedSignatureRef.current === undefined) {
      previousPinnedSignatureRef.current = pinnedMessageSignature;
      return;
    }
    if (previousPinnedSignatureRef.current === pinnedMessageSignature) return;
    previousPinnedSignatureRef.current = pinnedMessageSignature;
    refetchPinnedMessages().catch(() => undefined);
  }, [pinnedMessageSignature, refetchPinnedMessages]);

  useEffect(() => {
    clearTypist(lastMessage?.customerId);
  }, [lastMessage?._id, lastMessage?.customerId, clearTypist]);

  useEffect(() => {
    const handleReplyJump = (event: Event) => {
      const target = (event as CustomEvent<string>).detail;
      if (target) setPendingReplyTarget(target);
    };
    window.addEventListener('frontline:jump-to-message', handleReplyJump);
    return () =>
      window.removeEventListener('frontline:jump-to-message', handleReplyJump);
  }, []);

  useEffect(() => {
    if (!pendingReplyTarget) return;
    const escaped = CSS.escape(pendingReplyTarget);
    const target =
      document.querySelector<HTMLElement>(
        `[data-provider-message-id="${escaped}"]`,
      ) ||
      document.getElementById(`conversation-message-${pendingReplyTarget}`);

    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'center' });
      target.animate(
        [
          { backgroundColor: 'transparent' },
          { backgroundColor: 'hsl(var(--accent))' },
          { backgroundColor: 'transparent' },
        ],
        { duration: 900 },
      );
      setPendingReplyTarget(null);
      return;
    }

    if (!loading && messages.length < totalCount) {
      handleFetchMore();
    } else if (!loading) {
      setPendingReplyTarget(null);
    }
  }, [
    handleFetchMore,
    loading,
    messages.length,
    pendingReplyTarget,
    totalCount,
  ]);

  const isGroupConversation =
    new Set((messages || []).map((m: IMessage) => m.customerId).filter(Boolean))
      .size > 1;

  return (
    <div className="flex h-full min-h-0 flex-col">
      <PinnedMessagesBar
        conversationId={conversationId}
        messages={pinnedMessages}
        onSelectMessage={(messageId) =>
          window.dispatchEvent(
            new CustomEvent('frontline:jump-to-message', {
              detail: messageId,
            }),
          )
        }
      />
      <div className="min-h-0 flex-1">
        <InboxMessagesContainer
          fetchMore={handleFetchMore}
          messagesLength={messages?.length || 0}
          totalCount={totalCount}
          loading={loading}
        >
          {messages?.map((message: IMessage, index: number) => (
            <ConversationMessageContext.Provider
              value={{
                ...message,
                conversationId: message.conversationId || conversationId,
                previousMessage: messages[index - 1],
                nextMessage: messages[index + 1],
                isGroupConversation,
              }}
              key={message._id}
            >
              <MessageItem />
            </ConversationMessageContext.Provider>
          ))}
          <TypingIndicator names={typingNames} />
        </InboxMessagesContainer>
      </div>
    </div>
  );
};
