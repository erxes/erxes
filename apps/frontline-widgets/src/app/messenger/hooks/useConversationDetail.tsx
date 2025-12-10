import {
  QueryHookOptions,
  useQuery,
  gql,
  useApolloClient,
} from '@apollo/client';
import { GET_CONVERSATION_DETAIL } from '../graphql/queries';
import {
  ConversationMessageInserted,
  conversationBotTypingStatus,
} from '../graphql/subscriptions';
import { useEffect, useState } from 'react';
import { IConversation } from '../types';

interface IQueryResponse {
  widgetsConversationDetail: IConversation;
}

interface ISubscriptionData {
  conversationMessageInserted: IConversation['messages'][0];
}

interface IBotTypingSubscriptionData {
  conversationBotTypingStatus: {
    typing: boolean;
  } | null;
}

export const useConversationDetail = (
  options?: QueryHookOptions<IQueryResponse>,
) => {
  const client = useApolloClient();
  const [isBotTyping, setIsBotTyping] = useState(false);

  const { data, loading, refetch, subscribeToMore } = useQuery<IQueryResponse>(
    GET_CONVERSATION_DETAIL,
    {
      ...options,
      fetchPolicy: 'network-only',
    },
  );

  const handleRefetch = (args?: QueryHookOptions<IQueryResponse>) => {
    return refetch(args?.variables);
  };

  useEffect(() => {
    if (!options?.variables?._id) return;

    const unsubscribe = subscribeToMore<ISubscriptionData>({
      document: ConversationMessageInserted,
      variables: {
        _id: options.variables._id,
      },
      updateQuery: (prev, { subscriptionData }) => {
        if (!prev || !subscriptionData.data) return prev;

        const newMessage = subscriptionData.data.conversationMessageInserted;
        if (!newMessage) return prev;

        const messageExists = prev.widgetsConversationDetail.messages.some(
          (msg) => msg._id === newMessage._id,
        );

        if (messageExists) return prev;

        return {
          widgetsConversationDetail: {
            ...prev.widgetsConversationDetail,
            messages: [...prev.widgetsConversationDetail.messages, newMessage],
          },
        };
      },
    });

    return () => {
      unsubscribe();
    };
  }, [options?.variables?._id, subscribeToMore]);

  // Listen for bot message typing
  useEffect(() => {
    if (!options?.variables?._id) return;

    const botTypingSubscription = client
      .subscribe<IBotTypingSubscriptionData>({
        query: gql(conversationBotTypingStatus),
        variables: { _id: options.variables._id },
        fetchPolicy: 'network-only',
      })
      .subscribe({
        next({ data }) {
          if (data?.conversationBotTypingStatus) {
            const typingData = data.conversationBotTypingStatus;
            setIsBotTyping(
              typeof typingData === 'object' && typingData !== null
                ? (typingData as any).typing
                : false,
            );
          }
        },
      });

    return () => {
      botTypingSubscription.unsubscribe();
    };
  }, [options?.variables?._id, client]);

  return {
    conversationDetail: data?.widgetsConversationDetail,
    loading,
    handleRefetch,
    isBotTyping,
  };
};
