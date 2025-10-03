import { QueryHookOptions, useQuery } from '@apollo/client';
import { GET_CONVERSATION_DETAIL } from '../graphql/queries/getConversationDetail';
import { IConversation } from '@/inbox/types/Conversation';

export const useConversationDetail = (
  options: QueryHookOptions<{
    conversationDetail: IConversation;
  }>,
) => {
  const { data, loading } = useQuery<{ conversationDetail: IConversation }>(
    GET_CONVERSATION_DETAIL,
    options,
  );

  return {
    conversationDetail: data?.conversationDetail,
    loading,
  };
};
