import { InboxMessagesContainer } from '@/inbox/components/InboxMessagesContainer';
import { useFacebookConversationMessages } from '@/integrations/facebook/hooks/useFacebookConversationMessages';
import { useQueryState } from 'erxes-ui';
import { FacebookMessageRow } from '@/integrations/facebook/components/FacebookMessageRow';

export const FacebookConversationMessages = () => {
  const [conversationId] = useQueryState<string>('conversationId');
  const { facebookConversationMessages, handleFetchMore, loading, totalCount } =
    useFacebookConversationMessages();

  return (
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
  );
};
