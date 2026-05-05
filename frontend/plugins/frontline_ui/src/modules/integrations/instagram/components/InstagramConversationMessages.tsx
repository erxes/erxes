import { InboxMessagesContainer } from '@/inbox/components/InboxMessagesContainer';
import { useInstagramConversationMessages } from '../hooks/useInstagramConversationMessages';
import { IgMessengerMessageContext } from '../context/IgMessengerMessageContext';
import { IgMessengerMessage } from './IgMessengerMessages';

export const InstagramConversationMessages = () => {
  const { instagramConversationMessages, handleFetchMore, loading } =
    useInstagramConversationMessages();

  return (
    <InboxMessagesContainer
      fetchMore={handleFetchMore}
      messagesLength={instagramConversationMessages?.length || 0}
      totalCount={instagramConversationMessages?.length || 0}
      loading={loading}
    >
      {instagramConversationMessages?.map((message) => (
        <IgMessengerMessageContext.Provider
          value={{
            ...message,
            previousMessage:
              instagramConversationMessages[
                instagramConversationMessages.indexOf(message) - 1
              ],
            nextMessage:
              instagramConversationMessages[
                instagramConversationMessages.indexOf(message) + 1
              ],
          }}
          key={message._id}
        >
          <IgMessengerMessage />
        </IgMessengerMessageContext.Provider>
      ))}
    </InboxMessagesContainer>
  );
};
