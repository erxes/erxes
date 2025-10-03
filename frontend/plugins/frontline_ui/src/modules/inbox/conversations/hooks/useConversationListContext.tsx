import { useContext } from 'react';
import { ConversationListContext } from '../context/ConversationListContext';

export const useConversationListContext = () => {
  return useContext(ConversationListContext);
};
