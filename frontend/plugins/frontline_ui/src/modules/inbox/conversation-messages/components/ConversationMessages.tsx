import { useQueryState } from 'erxes-ui';
import { MessageItem } from './MessageItem';
import { IMessage } from '@/inbox/types/Conversation';
import { useConversationMessages } from '@/inbox/conversation-messages/hooks/useConversationMessages';
import { ConversationMessageContext } from '@/inbox/conversations/context/ConversationMessageContext';
import { InboxMessagesContainer } from '@/inbox/components/InboxMessagesContainer';

export const ConversationMessages = () => {
  const [conversationId] = useQueryState<string>('conversationId');

  const { messages, loading, handleFetchMore, totalCount } =
    useConversationMessages({
      variables: {
        conversationId,
        limit: 10,
        skip: 0,
      },
      fetchPolicy: 'cache-and-network',
    });

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
          }}
          key={message._id}
        >
          <MessageItem />
        </ConversationMessageContext.Provider>
      ))}
    </InboxMessagesContainer>
  );
};
