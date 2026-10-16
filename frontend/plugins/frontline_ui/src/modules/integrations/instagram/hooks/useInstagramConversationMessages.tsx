import { useQuery } from '@apollo/client';
import { GET_CONVERSATION_MESSAGES } from '@/integrations/instagram/graphql/queries/igConversationQueries';
import { useQueryState } from 'erxes-ui';
import { useCallback, useEffect, useMemo } from 'react';
import { CONVERSATION_MESSAGE_INSERTED } from '@/inbox/conversations/graphql/subscriptions/inboxSubscriptions';
import { toMessage } from '@/inbox/conversation-messages/utils/toMessage';
import { compactList } from '@/shared/utils/cursorList';

export const INSTAGRAM_CONVERSATION_MESSAGES_LIMIT = 20;

export const useInstagramConversationMessages = () => {
  const [conversationId] = useQueryState<string>('conversationId');

  const { data, loading, error, fetchMore, subscribeToMore, client } = useQuery(
    GET_CONVERSATION_MESSAGES,
    {
      variables: conversationId
        ? { conversationId, limit: INSTAGRAM_CONVERSATION_MESSAGES_LIMIT }
        : undefined,
      skip: !conversationId,
      fetchPolicy: 'cache-and-network',
    },
  );

  const instagramConversationMessages = useMemo(
    () =>
      data?.instagramConversationMessages
        ? compactList(data.instagramConversationMessages).map(toMessage)
        : undefined,
    [data?.instagramConversationMessages],
  );

  const totalCount = Math.max(
    data?.instagramConversationMessagesCount || 0,
    instagramConversationMessages?.length || 0,
  );

  const handleFetchMore = useCallback((): Promise<unknown> => {
    const loadedCount = instagramConversationMessages?.length || 0;
    if (loading || totalCount <= loadedCount) {
      return Promise.resolve();
    }
    return fetchMore({
      variables: {
        skip: loadedCount,
      },
      updateQuery: (prev, { fetchMoreResult }) => {
        if (!fetchMoreResult) return prev;
        const previousMessages = compactList(
          prev.instagramConversationMessages,
        );
        const existingIds = new Set(previousMessages.map((m) => m._id));
        const uniqueNewMessages = compactList(
          fetchMoreResult.instagramConversationMessages,
        ).filter((m) => !existingIds.has(m._id));
        if (!uniqueNewMessages.length) {
          return prev;
        }
        return {
          instagramConversationMessages: [
            ...uniqueNewMessages,
            ...previousMessages,
          ],
          instagramConversationMessagesCount:
            fetchMoreResult.instagramConversationMessagesCount,
        };
      },
    });
  }, [fetchMore, instagramConversationMessages, loading, totalCount]);

  useEffect(() => {
    if (!conversationId) return;
    const unsubscribe = subscribeToMore({
      document: CONVERSATION_MESSAGE_INSERTED,
      variables: { _id: conversationId },
      updateQuery: (prev, { subscriptionData }) => {
        const newMessage = subscriptionData.data?.conversationMessageInserted;

        if (!prev || !newMessage) return prev;

        const previousMessages = compactList(
          prev.instagramConversationMessages,
        );
        const messageExists = previousMessages.some(
          (msg) => msg._id === newMessage._id,
        );

        if (messageExists) {
          return {
            ...prev,
            instagramConversationMessages: previousMessages.map((message) =>
              message._id === newMessage._id
                ? { ...message, reactions: newMessage.reactions }
                : message,
            ),
          };
        }

        try {
          const conversationCacheId = client.cache.identify({
            __typename: 'Conversation',
            _id: conversationId,
          });

          if (conversationCacheId && !newMessage.internal) {
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
          instagramConversationMessages: [
            ...previousMessages,
            {
              ...newMessage,
              conversationId,
              __typename: 'InstagramConversationMessage',
            },
          ],
          instagramConversationMessagesCount:
            (prev.instagramConversationMessagesCount ?? 0) + 1,
        };
      },
    });
    return unsubscribe;
  }, [client.cache, conversationId, subscribeToMore]);

  return {
    instagramConversationMessages,
    totalCount,
    handleFetchMore,
    loading,
    error,
  };
};
