import { useQuery } from '@apollo/client';
import { GET_CONVERSATION_OPEN } from '@/report/graphql/queries/getChart';

export const useConversationOpen = () => {
  const { data, loading, error } = useQuery(GET_CONVERSATION_OPEN);

  return {
    conversationOpen: data?.conversationOpen,
    loading,
    error,
  };
};
