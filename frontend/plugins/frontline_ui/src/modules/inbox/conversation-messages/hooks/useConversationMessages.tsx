import { useQuery, type QueryHookOptions } from '@apollo/client';
import { useCallback, useEffect, useRef } from 'react';
import { GET_CONVERSATION_MESSAGES } from '@/inbox/conversations/conversation-detail/graphql/queries/getConversationMessages';
import { CONVERSATION_MESSAGE_INSERTED } from '@/inbox/conversations/graphql/subscriptions/inboxSubscriptions';
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

  // Track the skip offset separately from array length.
  // Array length includes subscription-pushed new messages which must NOT
  // advance the "how far back into history" offset we send the backend.
  // Initialized to the initial page size because useQuery already loaded
  // skip=0..limit-1; the first fetchMore must start at the next page.
  const initialLimit = options.variables?.limit ?? 10;
  const oldMessagesSkipRef = useRef(initialLimit);
  const prevConversationIdRef = useRef(options.variables?.conversationId);

  // Reset skip offset whenever the conversation changes.
  if (prevConversationIdRef.current !== options.variables?.conversationId) {
    prevConversationIdRef.current = options.variables?.conversationId;
    oldMessagesSkipRef.current = initialLimit;
  }

  const handleFetchMore = useCallback((): Promise<unknown> => {
    if (
      loading ||
      conversationMessagesTotalCount <= conversationMessages.length
    ) {
      return Promise.resolve();
    }
    const skip = oldMessagesSkipRef.current;
    // Always advance by the full page size so pagination stays page-aligned
    // with the backend.
    oldMessagesSkipRef.current = skip + 50;
    return fetchMore({
      variables: {
        skip,
        limit: 50,
      },
      updateQuery: (prev, { fetchMoreResult }) => {
        if (!fetchMoreResult || !fetchMoreResult.conversationMessages?.length) {
          return prev;
        }

        const existingIds = new Set(
          (prev.conversationMessages || []).map((m: IMessage) => m._id),
        );
        const uniqueNewMessages = fetchMoreResult.conversationMessages.filter(
          (m: IMessage) => !existingIds.has(m._id),
        );

        if (!uniqueNewMessages.length) {
          return prev;
        }

        return {
          conversationMessages: [
            ...uniqueNewMessages,
            ...prev.conversationMessages,
          ],
          conversationMessagesTotalCount:
            fetchMoreResult.conversationMessagesTotalCount ??
            prev.conversationMessagesTotalCount,
        };
      },
    });
  }, [
    conversationMessages.length,
    conversationMessagesTotalCount,
    fetchMore,
    loading,
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
