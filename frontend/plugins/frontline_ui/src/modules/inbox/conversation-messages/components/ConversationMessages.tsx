import { useEffect } from 'react';
import { MessageItem } from '@/inbox/conversation-messages/components/MessageItem';
import type { IMessage } from '@/inbox/types/Conversation';
import { useConversationMessages } from '@/inbox/conversation-messages/hooks/useConversationMessages';
import { useConversationTypingStatus } from '@/inbox/conversation-messages/hooks/useConversationTypingStatus';
import { TypingIndicator } from '@/inbox/conversation-messages/components/TypingIndicator';
import { ConversationMessageContext } from '@/inbox/conversations/context/ConversationMessageContext';
import { InboxMessagesContainer } from '@/inbox/components/InboxMessagesContainer';
import { useConversationContext } from '@/inbox/conversations/conversation-detail/hooks/useConversationContext';
import { useMessageNavigation } from '@/inbox/conversation-messages/hooks/useMessageNavigation';
import { PinnedMessagesBar } from '@/inbox/conversation-messages/components/pinned/PinnedMessagesBar';
import { IntegrationType } from '@/types/Integration';

export const ConversationMessages = ({
  conversationId,
}: {
  conversationId: string;
}) => {
  const { integration } = useConversationContext();
  const isDiscord = integration?.kind === IntegrationType.DISCORD_MESSENGER;
  const { messages, loading, handleFetchMore, totalCount } =
    useConversationMessages({
      variables: {
        conversationId,
        limit: isDiscord ? 50 : 10,
        skip: 0,
      },
      fetchPolicy: 'cache-and-network',
    });

  const { containerRef, jumpToMessage } = useMessageNavigation({
    conversationId,
    messagesLength: messages.length,
    totalCount,
    loading,
    handleFetchMore,
  });

  const { typingNames, clearTypist } =
    useConversationTypingStatus(conversationId);

  const lastMessage = messages?.[messages.length - 1];
  useEffect(() => {
    clearTypist(lastMessage?.customerId);
  }, [lastMessage?._id, lastMessage?.customerId, clearTypist]);

  const isGroupConversation =
    (messages || []).some(
      (message) =>
        message.extraData?.telegram?.chatType &&
        message.extraData.telegram.chatType !== 'private',
    ) ||
    new Set((messages || []).map((m: IMessage) => m.customerId).filter(Boolean))
      .size > 1;

  return (
    <div ref={containerRef} className="flex h-full min-h-0 flex-col">
      {isDiscord && (
        <PinnedMessagesBar
          key={conversationId}
          conversationId={conversationId}
          onSelectMessage={jumpToMessage}
        />
      )}
      <div className="min-h-0 flex-1">
        <InboxMessagesContainer
          conversationId={conversationId}
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
