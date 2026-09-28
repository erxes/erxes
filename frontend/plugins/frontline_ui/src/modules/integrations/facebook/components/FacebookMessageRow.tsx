import { normalizeFacebookAttachments } from '@/integrations/facebook/utils/messageAttachments';
import { FbMessengerMessageContext } from '@/integrations/facebook/contexts/FbMessengerMessageContext';
import { FbMessengerMessage } from '@/integrations/facebook/components/FbMessengerMessages';
import { ConversationMessageContext } from '@/inbox/conversations/context/ConversationMessageContext';
import {
  MessageDaySeparator,
  MessageItem,
} from '@/inbox/conversation-messages/components/MessageItem';
import { useMemo } from 'react';
import type { FacebookMessageRowProps } from '@/integrations/facebook/types/FacebookMessageRow';

export const FacebookMessageRow = ({
  message,
  previousMessage,
  nextMessage,
}: FacebookMessageRowProps) => {
  const needsFacebookRenderer = Boolean(
    message.botData?.length || message.source || message.relatedMessage,
  );
  const fbContextValue = useMemo(
    () => ({
      ...message,
      attachments: normalizeFacebookAttachments(message.attachments),
      previousMessage,
      nextMessage,
    }),
    [message, nextMessage, previousMessage],
  );
  const conversationContextValue = useMemo(
    () => ({
      ...message,
      attachments: normalizeFacebookAttachments(message.attachments),
      previousMessage,
      nextMessage,
    }),
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
