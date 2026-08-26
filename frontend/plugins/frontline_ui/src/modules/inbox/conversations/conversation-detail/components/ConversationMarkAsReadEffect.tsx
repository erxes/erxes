import { useConversationMarkAsRead } from '@/inbox/conversations/conversation-detail/hooks/useConversationMarkAsRead';
import { useEffect } from 'react';
import { useConversationContext } from '@/inbox/conversations/conversation-detail/hooks/useConversationContext';

export const ConversationMarkAsReadEffect = () => {
  const { _id } = useConversationContext();
  const { markAsRead } = useConversationMarkAsRead();

  useEffect(() => {
    if (!_id) return;

    markAsRead();
  }, [_id]);

  return <></>;
};
