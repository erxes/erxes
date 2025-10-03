import { useConversationMarkAsRead } from '../hooks/useConversationMarkAsRead';
import { useEffect } from 'react';
import { useConversationContext } from '../hooks/useConversationContext';

export const ConversationMarkAsReadEffect = () => {
  const { _id } = useConversationContext();
  const { markAsRead } = useConversationMarkAsRead();

  useEffect(() => {
    const timer = setTimeout(() => {
      markAsRead();
    }, 3000); // 3 seconds

    return () => clearTimeout(timer); // Cleanup
  }, [_id]);

  return <></>;
};
