import { connectionAtom, integrationIdAtom } from '../states';
import { GET_WIDGETS_CONVERSATIONS } from '../graphql/queries';
import { QueryHookOptions, useQuery } from '@apollo/client';
import { useAtomValue } from 'jotai';
import { useMemo, useEffect, useRef } from 'react';
import { IConversationMessage } from '../types';
import { getLocalStorageItem } from '@libs/utils';
import { ConversationMessageInserted } from '../graphql/subscriptions';

interface IQueryResponse {
  widgetsConversations: IConversationMessage[];
}

interface ISubscriptionData {
  conversationMessageInserted: IConversationMessage['messages'][0];
}

export const useConversations = (
  options?: QueryHookOptions<IQueryResponse>,
) => {
  const integrationId = useAtomValue(integrationIdAtom);
  const connection = useAtomValue(connectionAtom);
  const cachedCustomerId = getLocalStorageItem('customerId');
  const { customerId, visitorId } = connection.widgetsMessengerConnect || {};
  const { data, loading, error, subscribeToMore } = useQuery<IQueryResponse>(
    GET_WIDGETS_CONVERSATIONS,
    {
      ...options,
      variables: {
        integrationId,
        customerId: customerId || cachedCustomerId || undefined,
        visitorId: visitorId || undefined,
      },
      fetchPolicy: 'network-only',
      skip: !integrationId,
    },
  );

  const unsubscribeRefs = useRef<Array<() => void>>([]);

  useEffect(() => {
    if (!data?.widgetsConversations || !subscribeToMore) return;

    const conversations = data.widgetsConversations;
    const unsubscribes: Array<() => void> = [];

    conversations.forEach((conversation) => {
      const unsubscribe = subscribeToMore<ISubscriptionData>({
        document: ConversationMessageInserted,
        variables: {
          _id: conversation._id,
        },
        updateQuery: (prev, { subscriptionData }) => {
          if (!prev || !subscriptionData.data) return prev;

          const newMessage = subscriptionData.data.conversationMessageInserted;
          if (!newMessage) return prev;

          const conversationId = newMessage.conversationId;
          const conversationIndex = prev.widgetsConversations.findIndex(
            (conv) => conv._id === conversationId,
          );

          if (conversationIndex === -1) return prev;

          const conversation = prev.widgetsConversations[conversationIndex];
          const messageExists = conversation.messages.some(
            (msg) => msg._id === newMessage._id,
          );

          if (messageExists) return prev;

          const updatedConversations = [...prev.widgetsConversations];
          updatedConversations[conversationIndex] = {
            ...conversation,
            messages: [...conversation.messages, newMessage],
            content: newMessage.content,
          };

          return {
            widgetsConversations: updatedConversations,
          };
        },
      });

      unsubscribes.push(unsubscribe);
    });

    unsubscribeRefs.current = unsubscribes;

    return () => {
      unsubscribes.forEach((unsubscribe) => unsubscribe());
    };
  }, [data?.widgetsConversations, subscribeToMore]);

  return {
    conversations: data?.widgetsConversations || [],
    loading,
    error,
  };
};
