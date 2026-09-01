import { InboxMessagesContainer } from '@/inbox/components/InboxMessagesContainer';
import { useInstagramConversationMessages } from '../hooks/useInstagramConversationMessages';
import { ConversationMessageContext } from '@/inbox/conversations/context/ConversationMessageContext';
import { MessageItem } from '@/inbox/conversation-messages/components/MessageItem';
import type { IInstagramConversationMessage } from '@/integrations/instagram/types/InstagramTypes';

export const InstagramConversationMessages = () => {
  const {
    instagramConversationMessages,
    handleFetchMore,
    loading,
    totalCount,
  } = useInstagramConversationMessages();
  const messagesByMid = new Map<string, IInstagramConversationMessage>();
  for (const message of instagramConversationMessages || []) {
    if (message.mid) messagesByMid.set(message.mid, message);
  }

  return (
    <InboxMessagesContainer
      fetchMore={handleFetchMore}
      messagesLength={instagramConversationMessages?.length || 0}
      totalCount={totalCount}
      loading={loading}
    >
      {instagramConversationMessages?.map((message, index) => {
        const repliedMessage = message.replyTo?.messageId
          ? messagesByMid.get(message.replyTo.messageId)
          : undefined;
        return (
          <ConversationMessageContext.Provider
            value={{
              ...message,
              replyTo: message.replyTo
                ? {
                    ...message.replyTo,
                    content: repliedMessage?.content ?? message.replyTo.content,
                  }
                : undefined,
              previousMessage: instagramConversationMessages[index - 1],
              nextMessage: instagramConversationMessages[index + 1],
            }}
            key={message._id}
          >
            <MessageItem />
          </ConversationMessageContext.Provider>
        );
      })}
    </InboxMessagesContainer>
  );
};
