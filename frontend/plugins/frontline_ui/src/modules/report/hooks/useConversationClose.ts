import { useQuery } from '@apollo/client';
import { GET_CONVERSATION_CLOSE } from '@/report/graphql/queries/getChart';

export const useConversationClosed = () => {
  const { data, loading, error } = useQuery(GET_CONVERSATION_CLOSE);

  return {
    conversationClosed: data?.conversationClosed,
    loading,
    error,
  };
};
