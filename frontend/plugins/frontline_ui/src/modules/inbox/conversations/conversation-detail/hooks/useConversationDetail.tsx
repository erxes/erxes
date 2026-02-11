import { QueryHookOptions, useQuery } from '@apollo/client';
import { GET_CONVERSATION_DETAIL } from '../graphql/queries/getConversationDetail';
import { IConversation } from '@/inbox/types/Conversation';
import { IIntegration } from '@/integrations/types/Integration';

interface IConversationDetail extends IConversation {
  integration: IIntegration;
}

export const useConversationDetail = (
  options: QueryHookOptions<{
    conversationDetail: IConversationDetail;
  }>,
) => {
  const { data, loading } = useQuery<{
    conversationDetail: IConversationDetail;
  }>(GET_CONVERSATION_DETAIL, options);

  return {
    conversationDetail: data?.conversationDetail,
    loading,
  };
};
