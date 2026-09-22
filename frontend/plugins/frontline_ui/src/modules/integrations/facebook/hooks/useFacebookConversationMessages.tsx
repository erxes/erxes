import { useQuery } from '@apollo/client';
import { GET_CONVERSATION_MESSAGES } from '@/integrations/facebook/graphql/queries/fbConversationQueries';
import { useQueryState } from 'erxes-ui';
import type { IFacebookConversationMessage } from '@/integrations/facebook/types/FacebookTypes';
import { useCallback, useEffect, useRef } from 'react';
import { CONVERSATION_MESSAGE_INSERTED } from '@/inbox/conversations/graphql/subscriptions/inboxSubscriptions';

export interface IFacebookConversationMessagesQuery {
  facebookConversationMessages: IFacebookConversationMessage[];
  facebookConversationMessagesCount: number;
}
export interface IFacebookConversationMessagesQueryVariables {
  _id?: string;
  conversationId?: string;
  limit?: number;
  skip?: number;
  getFirst?: boolean;
}

export const FACEBOOK_CONVERSATION_MESSAGES_LIMIT = 20;

export const useFacebookConversationMessages = () => {
  const [conversationId] = useQueryState<string>('conversationId');
  const paginationRef = useRef({
    offset: 0,
    initialized: false,
    fetching: false,
  });

  useEffect(() => {
    paginationRef.current = { offset: 0, initialized: false, fetching: false };
  }, [conversationId]);

  const { data, loading, error, fetchMore, subscribeToMore, client } = useQuery<
    IFacebookConversationMessagesQuery,
    IFacebookConversationMessagesQueryVariables
  >(GET_CONVERSATION_MESSAGES, {
    variables: {
      conversationId: conversationId || '',
      limit: FACEBOOK_CONVERSATION_MESSAGES_LIMIT,
    },
    skip: !conversationId,
    fetchPolicy: 'cache-and-network',
    onCompleted: (result) => {
      const pagination = paginationRef.current;
      if (!pagination.initialized) {
        pagination.offset = result.facebookConversationMessages.length;
        pagination.initialized = true;
      }
    },
  });

  const { facebookConversationMessages } = data || {};

  const totalCount = Math.max(
    data?.facebookConversationMessagesCount || 0,
    facebookConversationMessages?.length || 0,
  );

  const handleFetchMore = useCallback((): Promise<unknown> => {
    const loadedCount = facebookConversationMessages?.length || 0;
    const pagination = paginationRef.current;
    if (
      loading ||
      !pagination.initialized ||
      pagination.fetching ||
      totalCount <= loadedCount
    ) {
      return Promise.resolve();
    }
    pagination.fetching = true;
    return fetchMore({
      variables: {
        skip: pagination.offset,
      },
      updateQuery: (prev, { fetchMoreResult }) => {
        if (!fetchMoreResult) {
          return prev;
        }
        const existingIds = new Set(
          (prev.facebookConversationMessages || []).map((m) => m._id),
        );
        const uniqueNewMessages =
          fetchMoreResult.facebookConversationMessages.filter(
            (m) => !existingIds.has(m._id),
          );
        if (!uniqueNewMessages.length) {
          return prev;
        }
        return {
          facebookConversationMessages: [
            ...uniqueNewMessages,
            ...prev.facebookConversationMessages,
          ],
          facebookConversationMessagesCount:
            fetchMoreResult.facebookConversationMessagesCount,
        };
      },
    })
      .then((result) => {
        pagination.offset += result.data.facebookConversationMessages.length;
        return result;
      })
      .finally(() => {
        pagination.fetching = false;
      });
  }, [facebookConversationMessages, fetchMore, loading, totalCount]);

  useEffect(() => {
    if (!conversationId) return;
    const unsubscribe = subscribeToMore<{
      conversationMessageInserted: IFacebookConversationMessage;
    }>({
      document: CONVERSATION_MESSAGE_INSERTED,
      variables: {
        _id: conversationId || '',
      },
      updateQuery: (prev, { subscriptionData }) => {
        if (!prev || !subscriptionData.data) return prev;

        const newMessage = subscriptionData.data.conversationMessageInserted;
        const currentMessages = Array.isArray(prev.facebookConversationMessages)
          ? prev.facebookConversationMessages
          : [];

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
  }, [client.cache, conversationId, subscribeToMore]);

  return {
    facebookConversationMessages,
    totalCount,
    handleFetchMore,
    loading,
    error,
  };
};
