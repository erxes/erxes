import { useContext } from 'react';
import { ConversationContext } from '@/inbox/conversations/context/ConversationContext';

export const useConversationContext = () => {
  const context = useContext(ConversationContext);
  if (!context) {
    throw new Error(
      'useConversationContext must be used within a ConversationContext',
    );
  }
  return context;
};
