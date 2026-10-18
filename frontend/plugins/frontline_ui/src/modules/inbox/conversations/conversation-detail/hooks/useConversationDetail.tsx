import { QueryHookOptions, useQuery } from '@apollo/client';
import { CONVERSATION_CHANGED } from '@/inbox/conversations/graphql/subscriptions/inboxSubscriptions';
import { GET_CONVERSATION_DETAIL } from '../graphql/queries/getConversationDetail';
import { useEffect } from 'react';
import type {
  ConversationDetailQuery,
  ConversationDetailQueryVariables,
} from '~/gql/graphql';

export const useConversationDetail = (
  options: QueryHookOptions<
    ConversationDetailQuery,
    ConversationDetailQueryVariables
  >,
) => {
  const { data, loading, refetch, subscribeToMore } = useQuery(
    GET_CONVERSATION_DETAIL,
    options,
  );

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
    conversationDetail: data?.conversationDetail ?? undefined,
    loading,
  };
};
