import { InboxMessagesContainer } from '@/inbox/components/InboxMessagesContainer';
import { useFacebookConversationMessages } from '../hooks/useFacebookConversationMessages';
import { FbMessengerMessageContext } from '../contexts/FbMessengerMessageContext';
import { FbMessengerMessage } from './FbMessengerMessages';
import { ConversationMessageContext } from '@/inbox/conversations/context/ConversationMessageContext';
import {
  MessageDaySeparator,
  MessageItem,
} from '@/inbox/conversation-messages/components/MessageItem';

export const FacebookConversationMessages = () => {
  const { facebookConversationMessages, handleFetchMore, loading, totalCount } =
    useFacebookConversationMessages();

  return (
    <InboxMessagesContainer
      fetchMore={handleFetchMore}
      messagesLength={facebookConversationMessages?.length || 0}
      totalCount={totalCount}
      loading={loading}
    >
      {facebookConversationMessages?.map((message, index) => {
        const previousMessage = facebookConversationMessages[index - 1];
        const nextMessage = facebookConversationMessages[index + 1];
        const needsFacebookRenderer = Boolean(
          message.botData?.length || message.source || message.relatedMessage,
        );

        return needsFacebookRenderer ? (
          <FbMessengerMessageContext.Provider
            value={{ ...message, previousMessage, nextMessage }}
            key={message._id}
          >
            <MessageDaySeparator
              createdAt={message.createdAt}
              previousCreatedAt={previousMessage?.createdAt}
            />
            <FbMessengerMessage />
          </FbMessengerMessageContext.Provider>
        ) : (
          <ConversationMessageContext.Provider
            value={{
              ...message,
              previousMessage,
              nextMessage,
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
