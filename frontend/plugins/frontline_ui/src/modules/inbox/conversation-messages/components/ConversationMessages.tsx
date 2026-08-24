import { useCallback, useEffect, useState } from 'react';
import { useAtomValue } from 'jotai';
import { currentUserState } from 'ui-modules';
import { MessageItem } from './MessageItem';
import { IMessage } from '@/inbox/types/Conversation';
import { useConversationMessages } from '@/inbox/conversation-messages/hooks/useConversationMessages';
import { useConversationTypingStatus } from '@/inbox/conversation-messages/hooks/useConversationTypingStatus';
import { TypingIndicator } from '@/inbox/conversation-messages/components/TypingIndicator';
import { ConversationMessageContext } from '@/inbox/conversations/context/ConversationMessageContext';
import { InboxMessagesContainer } from '@/inbox/components/InboxMessagesContainer';
import { PinnedMessagesBar } from '@/inbox/conversation-messages/components/PinnedMessagesBar';

export const ConversationMessages = ({
  conversationId,
}: {
  conversationId: string;
}) => {
  const [pendingPinnedMessageId, setPendingPinnedMessageId] = useState<
    string | null
  >(null);
  const currentUserId = useAtomValue(currentUserState)?._id || '';
  const { messages, loading, handleFetchMore, totalCount } =
    useConversationMessages({
      variables: {
        conversationId,
        limit: 10,
        skip: 0,
      },
      fetchPolicy: 'cache-and-network',
    });
  const { messages: pinnedMessages } = useConversationMessages(
    {
      variables: {
        conversationId,
        limit: 50,
        skip: 0,
        pinnedOnly: true,
      },
      fetchPolicy: 'cache-and-network',
    },
    { updateConversationPreview: false },
  );

  const { typingNames, clearTypist } = useConversationTypingStatus(
    conversationId,
  );

  const lastMessage = messages?.[messages.length - 1];
  useEffect(() => {
    clearTypist(lastMessage?.customerId);
  }, [lastMessage?._id, lastMessage?.customerId, clearTypist]);

  const isGroupConversation =
    new Set((messages || []).map((m: IMessage) => m.customerId).filter(Boolean))
      .size > 1;
  const pinnedMessageMap = new Map(
    [...(pinnedMessages || []), ...(messages || [])].map((message) => [
      message._id,
      message,
    ]),
  );
  const visiblePinnedMessages = [...pinnedMessageMap.values()]
    .filter((message) => message.pinnedByIds?.includes(currentUserId))
    .sort(
      (left, right) =>
        new Date(right.createdAt).getTime() -
        new Date(left.createdAt).getTime(),
    );

  const revealMessage = useCallback((messageId: string) => {
    const element = document.getElementById(
      `conversation-message-${messageId}`,
    );

    if (!element) return false;

    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    element.classList.add('ring-2', 'ring-primary', 'ring-offset-2');
    window.setTimeout(() => {
      element.classList.remove('ring-2', 'ring-primary', 'ring-offset-2');
    }, 1800);
    return true;
  }, []);

  useEffect(() => {
    if (!pendingPinnedMessageId) return;

    if (revealMessage(pendingPinnedMessageId)) {
      setPendingPinnedMessageId(null);
      return;
    }

    if ((messages?.length || 0) < totalCount) {
      void handleFetchMore();
    } else {
      setPendingPinnedMessageId(null);
    }
  }, [
    handleFetchMore,
    messages?.length,
    pendingPinnedMessageId,
    revealMessage,
    totalCount,
  ]);

  return (
    <div className="flex h-full min-h-0 flex-col">
      <PinnedMessagesBar
        messages={visiblePinnedMessages}
        onSelectMessage={(messageId) => {
          if (!revealMessage(messageId)) {
            setPendingPinnedMessageId(messageId);
          }
        }}
      />
      <div className="min-h-0 flex-1">
        <InboxMessagesContainer
          fetchMore={handleFetchMore}
          messagesLength={messages?.length || 0}
          totalCount={totalCount}
          loading={loading}
        >
          {messages?.map((message: IMessage, index: number) => {
            const replyMessage = messages.find(
              (candidate) =>
                candidate._id === message.replyToMessageId ||
                candidate.extraData?.discordMessageId ===
                  message.replyToMessageId,
            );

            return (
              <ConversationMessageContext.Provider
                value={{
                  ...message,
                  conversationId: message.conversationId || conversationId,
                  previousMessage: messages[index - 1],
                  nextMessage: messages[index + 1],
                  replyMessage,
                  isGroupConversation,
                }}
                key={message._id}
              >
                <MessageItem />
              </ConversationMessageContext.Provider>
            );
          })}
          <TypingIndicator names={typingNames} />
        </InboxMessagesContainer>
      </div>
    </div>
  );
};
