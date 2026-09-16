import { QueryHookOptions, useQuery } from '@apollo/client';
import { useCallback, useEffect, useRef } from 'react';
import { GET_CONVERSATION_MESSAGES } from '../../conversations/conversation-detail/graphql/queries/getConversationMessages';
import { CONVERSATION_MESSAGE_INSERTED } from '../../conversations/graphql/subscriptions/inboxSubscriptions';
import { IMessage } from '../../types/Conversation';

export const useConversationMessages = (
  options: QueryHookOptions<{
    conversationMessages: IMessage[];
    conversationMessagesTotalCount: number;
  }>,
) => {
  const { data, loading, fetchMore, subscribeToMore, client } = useQuery<{
    conversationMessages: IMessage[];
    conversationMessagesTotalCount: number;
  }>(GET_CONVERSATION_MESSAGES, options);

  const { conversationMessages, conversationMessagesTotalCount } = data || {
    conversationMessages: [],
    conversationMessagesTotalCount: 0,
  };

  const pageSize = options.variables?.limit ?? 10;
  const historicalOffsetRef = useRef(pageSize);
  const fetchMoreInFlightRef = useRef<Promise<unknown> | null>(null);
  const previousConversationIdRef = useRef(options.variables?.conversationId);

  if (previousConversationIdRef.current !== options.variables?.conversationId) {
    previousConversationIdRef.current = options.variables?.conversationId;
    historicalOffsetRef.current = pageSize;
    fetchMoreInFlightRef.current = null;
  }

  const handleFetchMore = useCallback((): Promise<unknown> => {
    if (
      loading ||
      fetchMoreInFlightRef.current ||
      conversationMessagesTotalCount <= conversationMessages.length
    ) {
      return fetchMoreInFlightRef.current || Promise.resolve();
    }

    const skip = historicalOffsetRef.current;
    const conversationId = options.variables?.conversationId;
    const request = fetchMore({
      variables: {
        skip,
        limit: pageSize,
      },
      updateQuery: (previous, { fetchMoreResult }) => {
        if (!fetchMoreResult?.conversationMessages?.length) return previous;

        const existingIds = new Set(
          previous.conversationMessages.map((message) => message._id),
        );
        const olderMessages = fetchMoreResult.conversationMessages.filter(
          (message) => !existingIds.has(message._id),
        );

        if (!olderMessages.length) return previous;

        return {
          conversationMessages: [
            ...olderMessages,
            ...previous.conversationMessages,
          ],
          conversationMessagesTotalCount:
            fetchMoreResult.conversationMessagesTotalCount,
        };
      },
    })
      .then((result) => {
        if (previousConversationIdRef.current === conversationId) {
          historicalOffsetRef.current = skip + pageSize;
        }
        return result;
      })
      .finally(() => {
        if (fetchMoreInFlightRef.current === request) {
          fetchMoreInFlightRef.current = null;
        }
      });

    fetchMoreInFlightRef.current = request;
    return request;
  }, [
    conversationMessages.length,
    conversationMessagesTotalCount,
    fetchMore,
    loading,
    options.variables?.conversationId,
    pageSize,
  ]);

  useEffect(() => {
    const unsubscribe = subscribeToMore<{
      conversationMessageInserted: IMessage;
    }>({
      document: CONVERSATION_MESSAGE_INSERTED,
      variables: {
        _id: options.variables?.conversationId,
      },
      updateQuery: (prev, { subscriptionData }) => {
        if (!prev || !subscriptionData.data) return prev;

        const newMessage = subscriptionData.data.conversationMessageInserted;

        // The same message id can be re-emitted to push an update (e.g. a Discord
        // poll's vote tallies refreshing on `extraData`). Replace the existing
        // copy in place so the card updates, rather than dropping the event as a
        // duplicate or appending a second bubble.
        const existingIndex = prev.conversationMessages.findIndex(
          (msg: IMessage) => msg._id === newMessage._id,
        );

        if (existingIndex !== -1) {
          const conversationMessages = [...prev.conversationMessages];
          conversationMessages[existingIndex] = {
            ...conversationMessages[existingIndex],
            ...newMessage,
          };
          return { ...prev, conversationMessages };
        }

        try {
          // Get the cache ID for the conversation
          const conversationId = client.cache.identify({
            __typename: 'Conversation',
            _id: options.variables?.conversationId,
          });

          if (conversationId && !newMessage.internal) {
            // Update the conversation in the cache
            client.cache.modify({
              id: conversationId,
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
          conversationMessages: [...prev.conversationMessages, newMessage],
          conversationMessagesTotalCount:
            (prev.conversationMessagesTotalCount || 0) + 1,
        };
      },
    });
    return unsubscribe;
  }, [options.variables?.conversationId]);

  return {
    messages: conversationMessages,
    totalCount: conversationMessagesTotalCount,
    loading,
    handleFetchMore,
  };
};
