import { QueryHookOptions, useQuery } from '@apollo/client';
import { CONVERSATION_CHANGED } from '@/inbox/conversations/graphql/subscriptions/inboxSubscriptions';
import { GET_CONVERSATION_DETAIL } from '../graphql/queries/getConversationDetail';
import { IConversation } from '@/inbox/types/Conversation';
import { IIntegration } from '@/integrations/types/Integration';
import { useEffect } from 'react';

interface IConversationDetail extends IConversation {
  integration: IIntegration;
}

interface IConversationDetailQueryResponse {
  conversationDetail: IConversationDetail;
}

interface IConversationDetailQueryVariables {
  _id?: string | null;
}

export const useConversationDetail = (
  options: QueryHookOptions<
    IConversationDetailQueryResponse,
    IConversationDetailQueryVariables
  >,
) => {
  const { data, loading, refetch, subscribeToMore } = useQuery<
    IConversationDetailQueryResponse,
    IConversationDetailQueryVariables
  >(GET_CONVERSATION_DETAIL, options);

  useEffect(() => {
    const conversationId = options.variables?._id;

    if (!conversationId) {
      return;
    }

    const unsubscribe = subscribeToMore({
      document: CONVERSATION_CHANGED,
      variables: { _id: conversationId },
      updateQuery: (prev) => {
        refetch();

        return prev;
      },
    });

    return () => {
      unsubscribe();
    };
  }, [options.variables?._id, refetch, subscribeToMore]);

  return {
    conversationDetail: data?.conversationDetail,
    loading,
  };
};
