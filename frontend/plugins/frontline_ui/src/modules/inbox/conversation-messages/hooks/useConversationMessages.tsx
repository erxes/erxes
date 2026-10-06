import { useQuery } from '@apollo/client';
import type { QueryHookOptions } from '@apollo/client';
import { useCallback, useEffect, useRef } from 'react';
import { GET_CONVERSATION_MESSAGES } from '@/inbox/conversations/conversation-detail/graphql/queries/getConversationMessages';
import {
  CONVERSATION_MESSAGE_INSERTED,
  CONVERSATION_MESSAGE_UPDATED,
} from '@/inbox/conversations/graphql/subscriptions/inboxSubscriptions';
import type { IMessage } from '@/inbox/types/Conversation';

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

  const conversationId = options.variables?.conversationId;
  const initialLimit = options.variables?.limit ?? 10;
  const oldMessagesSkipRef = useRef(initialLimit);
  const fetchMoreInFlightRef = useRef<Promise<unknown> | null>(null);
  const previousConversationIdRef = useRef(conversationId);

  if (previousConversationIdRef.current !== conversationId) {
    previousConversationIdRef.current = conversationId;
    oldMessagesSkipRef.current = initialLimit;
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

    const skip = oldMessagesSkipRef.current;
    const request = fetchMore({
      variables: {
        skip,
        limit: 50,
      },
      updateQuery: (prev, { fetchMoreResult }) => {
        if (!fetchMoreResult?.conversationMessages?.length) return prev;

        const existingIds = new Set(
          prev.conversationMessages.map((message) => message._id),
        );
        const uniqueMessages = fetchMoreResult.conversationMessages.filter(
          (message) => !existingIds.has(message._id),
        );

        if (!uniqueMessages.length) return prev;

        return {
          conversationMessages: [
            ...uniqueMessages,
            ...prev.conversationMessages,
          ],
          conversationMessagesTotalCount:
            fetchMoreResult.conversationMessagesTotalCount ??
            prev.conversationMessagesTotalCount,
        };
      },
    })
      .then((result) => {
        if (previousConversationIdRef.current === conversationId) {
          oldMessagesSkipRef.current = skip + 50;
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
    conversationId,
    fetchMore,
    loading,
  ]);

  useEffect(() => {
    const unsubscribeInserted = subscribeToMore<{
      conversationMessageInserted: IMessage;
    }>({
      document: CONVERSATION_MESSAGE_INSERTED,
      variables: {
        _id: conversationId,
      },
      updateQuery: (prev, { subscriptionData }) => {
        if (!prev || !subscriptionData.data) return prev;

        const newMessage = subscriptionData.data.conversationMessageInserted;

        // The same message id can be re-emitted to push an update (e.g. a Discord
        // survey's vote tallies refreshing on `extraData`). Replace the existing
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

        const cacheId = client.cache.identify({
          __typename: 'Conversation',
          _id: conversationId,
        });

        if (cacheId && !newMessage.internal) {
          client.cache.modify({
            id: cacheId,
            fields: {
              content: () => newMessage.content,
              updatedAt: () => newMessage.createdAt,
            },
          });
        }

        return {
          conversationMessages: [...prev.conversationMessages, newMessage],
          conversationMessagesTotalCount:
            (prev.conversationMessagesTotalCount || 0) + 1,
        };
      },
    });
    const unsubscribeUpdated = subscribeToMore<{
      conversationMessageUpdated: IMessage;
    }>({
      document: CONVERSATION_MESSAGE_UPDATED,
      variables: { _id: conversationId },
      updateQuery: (prev, { subscriptionData }) => {
        const message = subscriptionData.data?.conversationMessageUpdated;
        if (!prev || !message || message.conversationId !== conversationId) {
          return prev;
        }
        if (!prev.conversationMessages.some(({ _id }) => _id === message._id)) {
          return prev;
        }
        return {
          ...prev,
          conversationMessages: prev.conversationMessages.map((previous) =>
            previous._id === message._id
              ? { ...previous, ...message }
              : previous,
          ),
        };
      },
    });
    return () => {
      unsubscribeInserted();
      unsubscribeUpdated();
    };
  }, [client.cache, conversationId, subscribeToMore]);

  return {
    messages: conversationMessages,
    totalCount: conversationMessagesTotalCount,
    loading,
    handleFetchMore,
  };
};
