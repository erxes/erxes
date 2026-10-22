import { useQuery } from '@apollo/client';
import type { QueryHookOptions, Reference } from '@apollo/client';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import { GET_CONVERSATION_MESSAGES } from '@/inbox/conversations/conversation-detail/graphql/queries/getConversationMessages';
import {
  CONVERSATION_MESSAGE_INSERTED,
  CONVERSATION_MESSAGE_UPDATED,
} from '@/inbox/conversations/graphql/subscriptions/inboxSubscriptions';
import { toMessage } from '@/inbox/conversation-messages/utils/toMessage';
import { compactList } from '@/shared/utils/cursorList';
import type {
  ConversationMessagesQuery,
  ConversationMessagesQueryVariables,
} from '~/gql/graphql';

export const useConversationMessages = (
  options: QueryHookOptions<
    ConversationMessagesQuery,
    ConversationMessagesQueryVariables
  >,
) => {
  const { data, loading, fetchMore, subscribeToMore, client } = useQuery(
    GET_CONVERSATION_MESSAGES,
    options,
  );

  const conversationMessages = useMemo(
    () => compactList(data?.conversationMessages),
    [data?.conversationMessages],
  );
  const conversationMessagesTotalCount =
    data?.conversationMessagesTotalCount ?? 0;
  const messages = useMemo(
    () => conversationMessages.map(toMessage),
    [conversationMessages],
  );

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

        const previousMessages = compactList(prev.conversationMessages);
        const existingIds = new Set(
          previousMessages.map((message) => message._id),
        );
        const uniqueMessages = compactList(
          fetchMoreResult.conversationMessages,
        ).filter((message) => !existingIds.has(message._id));

        if (!uniqueMessages.length) return prev;

        return {
          conversationMessages: [...uniqueMessages, ...previousMessages],
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
    if (!conversationId) {
      return;
    }

    const unsubscribeInserted = subscribeToMore({
      document: CONVERSATION_MESSAGE_INSERTED,
      variables: {
        _id: conversationId,
      },
      updateQuery: (prev, { subscriptionData }) => {
        const newMessage = subscriptionData.data?.conversationMessageInserted;

        if (!prev || !newMessage) return prev;

        const previousMessages = compactList(prev.conversationMessages);

        // The same message id can be re-emitted to push an update (e.g. a Discord
        // survey's vote tallies refreshing on `extraData`). Replace the existing
        // copy in place so the card updates, rather than dropping the event as a
        // duplicate or appending a second bubble.
        const existingIndex = previousMessages.findIndex(
          (msg) => msg._id === newMessage._id,
        );

        if (existingIndex !== -1) {
          const conversationMessages = [...previousMessages];
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
              lastMessage: (
                previous: Reference | null,
                { readField, toReference },
              ) => {
                const previousDate = previous
                  ? readField<string>('createdAt', previous)
                  : undefined;
                if (
                  previousDate &&
                  Date.parse(previousDate) >
                    Date.parse(newMessage.createdAt ?? '')
                )
                  return previous;
                return toReference({
                  __typename: 'ConversationMessage',
                  _id: newMessage._id,
                });
              },
              updatedAt: () => newMessage.createdAt,
            },
          });
        }

        return {
          conversationMessages: [...previousMessages, newMessage],
          conversationMessagesTotalCount:
            (prev.conversationMessagesTotalCount || 0) + 1,
        };
      },
    });
    const unsubscribeUpdated = subscribeToMore({
      document: CONVERSATION_MESSAGE_UPDATED,
      variables: { _id: conversationId },
      updateQuery: (prev, { subscriptionData }) => {
        const message = subscriptionData.data?.conversationMessageUpdated;
        if (!prev || !message || message.conversationId !== conversationId) {
          return prev;
        }
        const previousMessages = compactList(prev.conversationMessages);
        if (!previousMessages.some(({ _id }) => _id === message._id)) {
          return prev;
        }
        return {
          ...prev,
          conversationMessages: previousMessages.map((previous) =>
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
    messages,
    totalCount: conversationMessagesTotalCount,
    loading,
    handleFetchMore,
  };
};
