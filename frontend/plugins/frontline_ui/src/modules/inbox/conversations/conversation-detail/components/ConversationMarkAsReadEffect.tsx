import { useConversationMarkAsRead } from '../hooks/useConversationMarkAsRead';
import { useEffect } from 'react';
import { useConversationContext } from '../hooks/useConversationContext';

export const ConversationMarkAsReadEffect = () => {
  const { _id } = useConversationContext();
  const { markAsRead } = useConversationMarkAsRead();

  useEffect(() => {
    if (!_id) return;

    markAsRead();
  }, [_id]);

  return <></>;
};
