import { MessageItem } from './MessageItem';
import { IMessage } from '@/inbox/types/Conversation';
import { useConversationMessages } from '@/inbox/conversation-messages/hooks/useConversationMessages';
import { ConversationMessageContext } from '@/inbox/conversations/context/ConversationMessageContext';
import { InboxMessagesContainer } from '@/inbox/components/InboxMessagesContainer';

export const ConversationMessages = ({
  conversationId,
}: {
  conversationId: string;
}) => {
  const { messages, loading, handleFetchMore, totalCount } =
    useConversationMessages({
      variables: {
        conversationId,
        limit: 10,
        skip: 0,
      },
      fetchPolicy: 'cache-and-network',
    });

  // A conversation with messages from more than one customer is a group chat
  // (Discord channel in group mode); show per-message authors in that case.
  const isGroupConversation =
    new Set((messages || []).map((m: IMessage) => m.customerId).filter(Boolean))
      .size > 1;

  return (
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
            previousMessage: messages[index - 1],
            nextMessage: messages[index + 1],
            isGroupConversation,
          }}
          key={message._id}
        >
          <MessageItem />
        </ConversationMessageContext.Provider>
      ))}
    </InboxMessagesContainer>
  );
};
