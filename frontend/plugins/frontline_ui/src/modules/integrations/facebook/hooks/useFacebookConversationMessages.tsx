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
  });

  const { facebookConversationMessages } = data || {};

  const totalCount = Math.max(
    data?.facebookConversationMessagesCount || 0,
    facebookConversationMessages?.length || 0,
  );

  const paginationOffsetRef = useRef(0);
  const previousConversationIdRef = useRef<string | null | undefined>(
    conversationId,
  );
  const fetchMoreInFlightRef = useRef(false);

  const handleFetchMore = useCallback((): Promise<unknown> => {
    if (previousConversationIdRef.current !== conversationId) {
      previousConversationIdRef.current = conversationId;
      paginationOffsetRef.current = 0;
      fetchMoreInFlightRef.current = false;
    }

    if (fetchMoreInFlightRef.current) {
      return Promise.resolve();
    }

    const currentOffset =
      paginationOffsetRef.current > 0
        ? paginationOffsetRef.current
        : Math.min(
            facebookConversationMessages?.length || 0,
            FACEBOOK_CONVERSATION_MESSAGES_LIMIT,
          );

    if (loading || totalCount <= currentOffset) {
      return Promise.resolve();
    }

    fetchMoreInFlightRef.current = true;

    return fetchMore({
      variables: {
        skip: currentOffset,
        limit: FACEBOOK_CONVERSATION_MESSAGES_LIMIT,
      },
      updateQuery: (prev, { fetchMoreResult }) => {
        fetchMoreInFlightRef.current = false;
        if (!fetchMoreResult) {
          return prev;
        }
        const incoming = fetchMoreResult.facebookConversationMessages || [];
        paginationOffsetRef.current = currentOffset + incoming.length;

        const existingIds = new Set(
          (prev.facebookConversationMessages || []).map((m) => m._id),
        );
        const uniqueNewMessages = incoming.filter(
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
    }).catch((err) => {
      fetchMoreInFlightRef.current = false;
      throw err;
    });
  }, [
    conversationId,
    facebookConversationMessages,
    fetchMore,
    loading,
    totalCount,
  ]);

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
  }, [conversationId]);

  return {
    facebookConversationMessages,
    totalCount,
    handleFetchMore,
    loading,
    error,
  };
};
