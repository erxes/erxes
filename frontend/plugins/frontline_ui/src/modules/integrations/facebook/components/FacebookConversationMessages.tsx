import { InboxMessagesContainer } from '@/inbox/components/InboxMessagesContainer';
import { useFacebookConversationMessages } from '../hooks/useFacebookConversationMessages';
import { FbMessengerMessageContext } from '../contexts/FbMessengerMessageContext';
import { FbMessengerMessage } from './FbMessengerMessages';
import { ConversationMessageContext } from '@/inbox/conversations/context/ConversationMessageContext';
import {
  MessageDaySeparator,
  MessageItem,
} from '@/inbox/conversation-messages/components/MessageItem';
import { useMemo } from 'react';
import { useQueryState } from 'erxes-ui';
import type { IFacebookConversationMessage } from '../types/FacebookTypes';

type FacebookMessageRowProps = {
  message: IFacebookConversationMessage;
  previousMessage: IFacebookConversationMessage;
  nextMessage: IFacebookConversationMessage;
};

const FacebookMessageRow = ({
  message,
  previousMessage,
  nextMessage,
}: FacebookMessageRowProps) => {
  const needsFacebookRenderer = Boolean(
    message.botData?.length || message.source || message.relatedMessage,
  );
  const fbContextValue = useMemo(
    () => ({ ...message, previousMessage, nextMessage }),
    [message, nextMessage, previousMessage],
  );
  const conversationContextValue = useMemo(
    () => ({ ...message, previousMessage, nextMessage }),
    [message, nextMessage, previousMessage],
  );

  if (needsFacebookRenderer) {
    return (
      <FbMessengerMessageContext.Provider value={fbContextValue}>
        <MessageDaySeparator
          createdAt={message.createdAt}
          previousCreatedAt={previousMessage?.createdAt}
        />
        <FbMessengerMessage />
      </FbMessengerMessageContext.Provider>
    );
  }

  return (
    <ConversationMessageContext.Provider value={conversationContextValue}>
      <MessageItem />
    </ConversationMessageContext.Provider>
  );
};

export const FacebookConversationMessages = () => {
  const [conversationId] = useQueryState<string>('conversationId');
  const { facebookConversationMessages, handleFetchMore, loading, totalCount } =
    useFacebookConversationMessages();

  return (
    <InboxMessagesContainer
      conversationId={conversationId ?? undefined}
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
