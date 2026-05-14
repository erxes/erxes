import { QueryHookOptions, useQuery } from '@apollo/client';
import { GET_CONVERSATION_CLOSE } from '@/report/graphql/queries/getChart';

interface IConversationClosed {
  count: number;
  percentage: number;
}
export const useConversationClosed = (
  options?: QueryHookOptions<{
    reportConversationClosed: IConversationClosed;
  }>,
) => {
  const { data, loading, error } = useQuery<{
    reportConversationClosed: IConversationClosed;
  }>(GET_CONVERSATION_CLOSE, options);

  return {
    conversationClosed: data?.reportConversationClosed,
    loading,
    error,
  };
};
