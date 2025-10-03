import { InboxMessagesContainer } from '@/inbox/components/InboxMessagesContainer';
import { useFacebookConversationMessages } from '../hooks/useFacebookConversationMessages';
import { FbMessengerMessageContext } from '../contexts/FbMessengerMessageContext';
import { FbMessengerMessage } from './FbMessengerMessages';

export const FacebookConversationMessages = () => {
  const { facebookConversationMessages, handleFetchMore, loading } =
    useFacebookConversationMessages();

  return (
    <InboxMessagesContainer
      fetchMore={handleFetchMore}
      messagesLength={facebookConversationMessages?.length || 0}
      totalCount={facebookConversationMessages?.length || 0}
      loading={loading}
    >
      {facebookConversationMessages?.map((message) => (
        <FbMessengerMessageContext.Provider
          value={{
            ...message,
            previousMessage:
              facebookConversationMessages[
                facebookConversationMessages.indexOf(message) - 1
              ],
            nextMessage:
              facebookConversationMessages[
                facebookConversationMessages.indexOf(message) + 1
              ],
          }}
          key={message._id}
        >
          <FbMessengerMessage />
        </FbMessengerMessageContext.Provider>
      ))}
    </InboxMessagesContainer>
  );
};
