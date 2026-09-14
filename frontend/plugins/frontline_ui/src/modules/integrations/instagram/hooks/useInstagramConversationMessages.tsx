import { useQuery } from '@apollo/client';
import { GET_CONVERSATION_MESSAGES } from '@/integrations/instagram/graphql/queries/igConversationQueries';
import { useQueryState } from 'erxes-ui';
import type { IInstagramConversationMessage } from '@/integrations/instagram/types/InstagramTypes';
import { useCallback, useEffect } from 'react';
import { CONVERSATION_MESSAGE_INSERTED } from '@/inbox/conversations/graphql/subscriptions/inboxSubscriptions';

export interface IInstagramConversationMessagesQuery {
  instagramConversationMessages: IInstagramConversationMessage[];
  instagramConversationMessagesCount: number;
}
export interface IInstagramConversationMessagesQueryVariables {
  _id?: string;
  conversationId?: string;
  limit?: number;
  skip?: number;
  getFirst?: boolean;
}

export const INSTAGRAM_CONVERSATION_MESSAGES_LIMIT = 20;

export const useInstagramConversationMessages = () => {
  const [conversationId] = useQueryState<string>('conversationId');

  const { data, loading, error, fetchMore, subscribeToMore, client } = useQuery<
    IInstagramConversationMessagesQuery,
    IInstagramConversationMessagesQueryVariables
  >(GET_CONVERSATION_MESSAGES, {
    variables: {
      conversationId: conversationId || '',
      limit: INSTAGRAM_CONVERSATION_MESSAGES_LIMIT,
    },
    skip: !conversationId,
    fetchPolicy: 'cache-and-network',
  });

  const { instagramConversationMessages } = data || {};

  const totalCount = Math.max(
    data?.instagramConversationMessagesCount || 0,
    instagramConversationMessages?.length || 0,
  );

  const handleFetchMore = useCallback((): Promise<unknown> => {
    const loadedCount = instagramConversationMessages?.length || 0;
    if (loading || totalCount <= loadedCount) {
      return Promise.resolve();
    }
    if (loadedCount % INSTAGRAM_CONVERSATION_MESSAGES_LIMIT !== 0) {
      return Promise.resolve();
    }
    return fetchMore({
      variables: {
        skip: loadedCount,
      },
      updateQuery: (prev, { fetchMoreResult }) => {
        if (!fetchMoreResult) return prev;
        const existingIds = new Set(
          (prev.instagramConversationMessages || []).map((m) => m._id),
        );
        const uniqueNewMessages =
          fetchMoreResult.instagramConversationMessages.filter(
            (m) => !existingIds.has(m._id),
          );
        if (!uniqueNewMessages.length) {
          return prev;
        }
        return {
          instagramConversationMessages: [
            ...uniqueNewMessages,
            ...prev.instagramConversationMessages,
          ],
          instagramConversationMessagesCount:
            fetchMoreResult.instagramConversationMessagesCount,
        };
      },
    });
  }, [fetchMore, instagramConversationMessages, loading, totalCount]);

  useEffect(() => {
    if (!conversationId) return;
    const unsubscribe = subscribeToMore<{
      conversationMessageInserted: IInstagramConversationMessage;
    }>({
      document: CONVERSATION_MESSAGE_INSERTED,
      variables: { _id: conversationId || '' },
      updateQuery: (prev, { subscriptionData }) => {
        if (!prev || !subscriptionData.data) return prev;

        const newMessage = subscriptionData.data.conversationMessageInserted;

        const messageExists = prev.instagramConversationMessages.some(
          (msg) => msg._id === newMessage._id,
        );

        if (messageExists) return prev;

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
            ...prev.instagramConversationMessages,
            {
              ...newMessage,
              conversationId,
              __typename: 'InstagramConversationMessage',
            },
          ],
          instagramConversationMessagesCount:
            prev.instagramConversationMessagesCount + 1,
        };
      },
    });
    return unsubscribe;
  }, [conversationId]);

  return {
    instagramConversationMessages,
    totalCount,
    handleFetchMore,
    loading,
    error,
  };
};
