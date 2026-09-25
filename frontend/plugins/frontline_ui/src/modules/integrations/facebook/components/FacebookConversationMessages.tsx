import { InboxMessagesContainer } from '@/inbox/components/InboxMessagesContainer';
import { useFacebookConversationMessages } from '@/integrations/facebook/hooks/useFacebookConversationMessages';
import { useQueryState } from 'erxes-ui';
import { FacebookMessageRow } from '@/integrations/facebook/components/FacebookMessageRow';
import { FacebookReplyWindowContext } from '@/integrations/facebook/contexts/FacebookReplyWindowContext';
import { FACEBOOK_HUMAN_AGENT_WINDOW_HOURS } from '@/integrations/facebook/constants/FbMessageWindow';
import { differenceInHours } from 'date-fns';

export const FacebookConversationMessages = () => {
  const [conversationId] = useQueryState<string>('conversationId');
  const { facebookConversationMessages, handleFetchMore, loading, totalCount } =
    useFacebookConversationMessages();
  const lastCustomerMessage = [...(facebookConversationMessages || [])]
    .reverse()
    .find(
      (message) => message.customerId && !message.internal && !message.botData,
    );
  const lastMessage =
    facebookConversationMessages?.[facebookConversationMessages.length - 1];
  const referenceDate =
    lastCustomerMessage?.createdAt || lastMessage?.createdAt;
  const replyWindowExpired = Boolean(
    referenceDate &&
      differenceInHours(new Date(), new Date(referenceDate)) >=
        FACEBOOK_HUMAN_AGENT_WINDOW_HOURS,
  );

  return (
    <FacebookReplyWindowContext.Provider value={replyWindowExpired}>
      <InboxMessagesContainer
        key={conversationId ?? undefined}
        fetchMore={handleFetchMore}
        messagesLength={facebookConversationMessages?.length || 0}
        totalCount={totalCount}
        loading={loading}
      >
        {facebookConversationMessages?.map((message, index) => {
          return (
            <FacebookMessageRow
              key={message._id}
              message={message}
              previousMessage={facebookConversationMessages[index - 1]}
              nextMessage={facebookConversationMessages[index + 1]}
            />
          );
        })}
      </InboxMessagesContainer>
    </FacebookReplyWindowContext.Provider>
  );
};
