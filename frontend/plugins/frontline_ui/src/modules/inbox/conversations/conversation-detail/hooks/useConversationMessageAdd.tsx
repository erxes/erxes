import { useMutation } from '@apollo/client';
import { ADD_CONVERSATION_MESSAGE } from '../graphql/mutations/addConversationMessage';

export const useConversationMessageAdd = () => {
  const [addConversationMessage, { loading }] = useMutation(
    ADD_CONVERSATION_MESSAGE,
  );

  return {
    addConversationMessage,
    loading,
  };
};
