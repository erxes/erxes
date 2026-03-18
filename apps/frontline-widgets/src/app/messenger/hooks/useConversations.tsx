import { connectionAtom, integrationIdAtom, lastUnreadMessageAtom } from '../states';
import { GET_WIDGETS_CONVERSATIONS } from '../graphql/queries';
import { QueryHookOptions, useQuery } from '@apollo/client';
import { useAtomValue, useSetAtom } from 'jotai';
import { useEffect, useRef } from 'react';
import { IConversationMessage } from '../types';
import { getLocalStorageItem } from '@libs/utils';
import { ConversationMessageInserted } from '../graphql/subscriptions';

interface IQueryResponse {
  widgetsConversations: IConversationMessage[];
}

interface ISubscriptionData {
  conversationMessageInserted: IConversationMessage['messages'][0];
}

interface IUseConversationsOptions extends QueryHookOptions<IQueryResponse> {
  /** When true, sets up GraphQL subscriptions and tracks new messages for notifications.
   *  Should only be true at the app root level so subscriptions stay alive regardless of
   *  which tab is active or whether the messenger is visible. */
  setupSubscriptions?: boolean;
}

export const useConversations = (options?: IUseConversationsOptions) => {
  const { setupSubscriptions = false, ...queryOptions } = options || {};
  const integrationId = useAtomValue(integrationIdAtom);
  const connection = useAtomValue(connectionAtom);
  const setLastUnreadMessage = useSetAtom(lastUnreadMessageAtom);
  const cachedCustomerId = getLocalStorageItem('customerId');
  const { customerId, visitorId } = connection.widgetsMessengerConnect || {};
  const { data, loading, error, subscribeToMore } = useQuery<IQueryResponse>(
    GET_WIDGETS_CONVERSATIONS,
    {
      ...queryOptions,
      variables: {
        integrationId,
        customerId: customerId || cachedCustomerId || undefined,
        visitorId: visitorId || undefined,
      },
      fetchPolicy: queryOptions.fetchPolicy ?? 'network-only',
      skip: !integrationId,
    },
  );

  const unsubscribeRefs = useRef<Array<() => void>>([]);

  useEffect(() => {
    if (!setupSubscriptions) return;
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

          // Count incoming agent/bot messages for the unread badge.
          // The subscription fragment returns `user { _id }` (nested), not a
          // flat `userId`, so we check user?._id rather than userId.
          if (newMessage.user?._id || newMessage.fromBot) {
            setLastUnreadMessage(newMessage);
          }

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
  }, [
    setupSubscriptions,
    data?.widgetsConversations,
    subscribeToMore,
    setLastUnreadMessage,
  ]);

  return {
    conversations: data?.widgetsConversations || [],
    loading,
    error,
  };
};
