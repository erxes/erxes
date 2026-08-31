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
import { useEffect } from 'react';
import { IConversation } from '../types';
import { useBotTyping } from './useBotTyping';

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
  const { isBotTyping, startBotTyping, stopBotTyping } = useBotTyping();

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

        if (newMessage.fromBot) {
          stopBotTyping();
        }

        const existingIndex = prev.widgetsConversationDetail.messages.findIndex(
          (msg) => msg._id === newMessage._id,
        );

        const messages = [...prev.widgetsConversationDetail.messages];

        if (existingIndex !== -1) {
          messages[existingIndex] = {
            ...messages[existingIndex],
            ...newMessage,
          };
        } else {
          messages.push(newMessage);
        }

        return {
          widgetsConversationDetail: {
            ...prev.widgetsConversationDetail,
            messages,
          },
        };
      },
    });

    return () => {
      unsubscribe();
    };
  }, [options?.variables?._id, subscribeToMore, stopBotTyping]);

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
          const typingData = data?.conversationBotTypingStatus;

          if (!typingData) return;

          if (typingData.typing) {
            startBotTyping();
          } else {
            stopBotTyping();
          }
        },
      });

    return () => {
      botTypingSubscription.unsubscribe();
    };
  }, [options?.variables?._id, client, startBotTyping, stopBotTyping]);

  return {
    conversationDetail: data?.widgetsConversationDetail,
    loading,
    handleRefetch,
    isBotTyping,
  };
};
