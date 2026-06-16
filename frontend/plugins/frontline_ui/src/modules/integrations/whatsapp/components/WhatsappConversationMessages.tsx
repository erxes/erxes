import { InboxMessagesContainer } from '@/inbox/components/InboxMessagesContainer';
import { WhatsappMessengerMessageContext } from '../context/WhatsappMessengerMessageContext';
import { useWhatsappConversationMessages } from '../hooks/useWhatsappConversationMessages';
import { WhatsappMessengerMessage } from './WhatsappMessengerMessages';

export const WhatsappConversationMessages = () => {
  const { whatsappConversationMessages, handleFetchMore, loading } =
    useWhatsappConversationMessages();

  return (
    <InboxMessagesContainer
      fetchMore={handleFetchMore}
      messagesLength={whatsappConversationMessages?.length || 0}
      totalCount={whatsappConversationMessages?.length || 0}
      loading={loading}
    >
      {whatsappConversationMessages?.map((message) => (
        <WhatsappMessengerMessageContext.Provider
          value={{
            ...message,
            previousMessage:
              whatsappConversationMessages[
                whatsappConversationMessages.indexOf(message) - 1
              ],
            nextMessage:
              whatsappConversationMessages[
                whatsappConversationMessages.indexOf(message) + 1
              ],
          }}
          key={message._id}
        >
          <WhatsappMessengerMessage />
        </WhatsappMessengerMessageContext.Provider>
      ))}
    </InboxMessagesContainer>
  );
};
