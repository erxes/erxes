import { useMutation } from '@apollo/client';
import { CONVERSATION_ASSIGN } from '../graphql/mutations/conversationAssign';

export const useConversationListAssign = () => {
  const [conversationListAssign, { loading }] =
    useMutation(CONVERSATION_ASSIGN);

  return { conversationListAssign, loading };
};
