import { useConversationMarkAsRead } from '@/inbox/conversations/conversation-detail/hooks/useConversationMarkAsRead';
import { useEffect } from 'react';
import { useConversationContext } from '@/inbox/conversations/conversation-detail/hooks/useConversationContext';
import { useSubscription } from '@apollo/client';
import { CONVERSATION_MESSAGE_INSERTED } from '@/inbox/conversations/graphql/subscriptions/inboxSubscriptions';

interface IInsertedConversationMessage {
  conversationMessageInserted: {
    customerId?: string;
  };
}

export const ConversationMarkAsReadEffect = () => {
  const { _id } = useConversationContext();
  const { markAsRead } = useConversationMarkAsRead();

  useEffect(() => {
    if (!_id) return;

    markAsRead();
  }, [_id]);

  useSubscription<IInsertedConversationMessage>(
    CONVERSATION_MESSAGE_INSERTED,
    {
      variables: { _id },
      skip: !_id,
      onData: ({ data }) => {
        if (data.data?.conversationMessageInserted.customerId) {
          markAsRead({ force: true });
        }
      },
    },
  );

  return <></>;
};
