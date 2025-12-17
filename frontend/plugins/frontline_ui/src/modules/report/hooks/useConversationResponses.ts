import { useQuery } from '@apollo/client';
import { GET_CONVERSATION_RESPONSES } from '@/report/graphql/queries/getChart';

export const useConversationResponses = () => {
  const { data, loading, error } = useQuery(GET_CONVERSATION_RESPONSES);

  return {
    conversationResponses: data?.conversationResponses,
    loading,
    error,
  };
};
