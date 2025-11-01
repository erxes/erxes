import { useMutation } from '@apollo/client';
import { READ_CONVERSATION_MESSAGES_MUTATION } from '../graphql/mutations';

interface ReadConversationResult {
  widgetsReadConversationMessages: string;
}

interface ReadConversationVariables {
  conversationId?: string;
}
const useReadConversation = () => {
  const [mutate, { loading, error }] = useMutation<
    ReadConversationResult,
    ReadConversationVariables
  >(READ_CONVERSATION_MESSAGES_MUTATION);

  return { readConversation: mutate, loading, error };
};

export {
  useReadConversation,
  type ReadConversationResult,
  type ReadConversationVariables,
};
