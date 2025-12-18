import { QueryHookOptions, useQuery } from '@apollo/client';
import { GET_CONVERSATION_RESPONSES } from '@/report/graphql/queries/getChart';

interface ConversationResponsesResponse {
  reportConversationResponses: {
    totalResponses: number;
    avgResponseTime: number;
    responseRate: number;
    count: number;
  };
}
export const useConversationResponses = (
  options?: QueryHookOptions<ConversationResponsesResponse>,
) => {
  const { data, loading, error } = useQuery<ConversationResponsesResponse>(
    GET_CONVERSATION_RESPONSES,
    options,
  );

  return {
    conversationResponses: data?.reportConversationResponses,
    loading,
    error,
  };
};
