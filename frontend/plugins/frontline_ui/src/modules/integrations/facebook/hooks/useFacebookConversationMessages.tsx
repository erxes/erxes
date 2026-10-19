import { useQuery } from '@apollo/client';
import { GET_CONVERSATION_MESSAGES } from '@/integrations/facebook/graphql/queries/fbConversationQueries';
import { useQueryState } from 'erxes-ui';
import {
  toFacebookMessageExtras,
  type IFacebookConversationMessage,
} from '@/integrations/facebook/types/FacebookTypes';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import { CONVERSATION_MESSAGE_INSERTED } from '@/inbox/conversations/graphql/subscriptions/inboxSubscriptions';
import { FACEBOOK_CONVERSATION_MESSAGES_LIMIT } from '@/integrations/facebook/constants/conversationMessages';
import { toMessage } from '@/inbox/conversation-messages/utils/toMessage';
import { compactList } from '@/shared/utils/cursorList';

export const useFacebookConversationMessages = () => {
  const [conversationId] = useQueryState<string>('conversationId');
  const paginationRef = useRef({
    fetching: false,
  });

  useEffect(() => {
    paginationRef.current = { fetching: false };
  }, [conversationId]);

  const { data, loading, error, fetchMore, subscribeToMore, client } = useQuery(
    GET_CONVERSATION_MESSAGES,
    {
      variables: conversationId
        ? { conversationId, limit: FACEBOOK_CONVERSATION_MESSAGES_LIMIT }
        : undefined,
      skip: !conversationId,
      fetchPolicy: 'cache-and-network',
      notifyOnNetworkStatusChange: true,
    },
  );

  const subscribeToMoreRef = useRef(subscribeToMore);
  useEffect(() => {
    subscribeToMoreRef.current = subscribeToMore;
  }, [subscribeToMore]);

  const facebookConversationMessages = useMemo(
    () =>
      data?.facebookConversationMessages
        ? compactList(data.facebookConversationMessages).map(
            (message): IFacebookConversationMessage => ({
              ...toMessage(message),
              ...toFacebookMessageExtras(message),
            }),
          )
        : undefined,
    [data?.facebookConversationMessages],
  );

  const totalCount = Math.max(
    data?.facebookConversationMessagesCount || 0,
    facebookConversationMessages?.length || 0,
  );

  const handleFetchMore = useCallback((): Promise<unknown> => {
    const loadedCount = facebookConversationMessages?.length || 0;
    const pagination = paginationRef.current;
    if (loading || pagination.fetching || totalCount <= loadedCount) {
      return Promise.resolve();
    }
    pagination.fetching = true;
    return fetchMore({
      variables: {
        skip: loadedCount,
      },
      updateQuery: (prev, { fetchMoreResult }) => {
        if (!fetchMoreResult) {
          return prev;
        }
        const previousMessages = compactList(prev.facebookConversationMessages);
        const existingIds = new Set(previousMessages.map((m) => m._id));
        const uniqueNewMessages = compactList(
          fetchMoreResult.facebookConversationMessages,
        ).filter((m) => !existingIds.has(m._id));
        if (!uniqueNewMessages.length) {
          return prev;
        }
        return {
          facebookConversationMessages: [
            ...uniqueNewMessages,
            ...previousMessages,
          ],
          facebookConversationMessagesCount:
            fetchMoreResult.facebookConversationMessagesCount,
        };
      },
    }).finally(() => {
      pagination.fetching = false;
    });
  }, [facebookConversationMessages, fetchMore, loading, totalCount]);

  useEffect(() => {
    if (!conversationId) return;
    const unsubscribe = subscribeToMoreRef.current({
      document: CONVERSATION_MESSAGE_INSERTED,
      variables: {
        _id: conversationId,
      },
      updateQuery: (prev, { subscriptionData }) => {
        if (!prev || !subscriptionData.data?.conversationMessageInserted)
          return prev;

        const newMessage = subscriptionData.data.conversationMessageInserted;
        const currentMessages = compactList(prev.facebookConversationMessages);

        // Check if the message already exists to prevent duplicates
        const existingMessageIndex = currentMessages.findIndex(
          (message) => message._id === newMessage._id,
        );

        if (existingMessageIndex !== -1) {
          return {
            ...prev,
            facebookConversationMessages: currentMessages.map(
              (message, index) =>
                index === existingMessageIndex
                  ? {
                      ...message,
                      ...newMessage,
                      conversationId,
                      __typename: 'FacebookConversationMessage',
                    }
                  : message,
            ),
          };
        }

        const oldestMessage = currentMessages[0];
        if (
          oldestMessage &&
          currentMessages.length <
            (prev.facebookConversationMessagesCount ?? 0) &&
          new Date(newMessage.createdAt ?? 0) <
            new Date(oldestMessage.createdAt ?? 0)
        ) {
          return prev;
        }

        try {
          // Get the cache ID for the conversation
          const conversationCacheId = client.cache.identify({
            __typename: 'Conversation',
            _id: conversationId,
          });

          if (conversationCacheId && !newMessage.internal) {
            // Update the conversation in the cache
            client.cache.modify({
              id: conversationCacheId,
              fields: {
                content: () => newMessage.content,
                updatedAt: () => newMessage.createdAt,
              },
            });
          }
        } catch (error) {
          console.error('Error updating cache:', error);
        }

        return {
          ...prev,
          facebookConversationMessages: [
            ...currentMessages,
            {
              ...newMessage,
              conversationId,
              __typename: 'FacebookConversationMessage',
            },
          ],
          facebookConversationMessagesCount:
            (prev.facebookConversationMessagesCount || 0) + 1,
        };
      },
    });
    return unsubscribe;
  }, [client.cache, conversationId]);

  return {
    facebookConversationMessages,
    totalCount,
    handleFetchMore,
    loading,
    error,
  };
};
