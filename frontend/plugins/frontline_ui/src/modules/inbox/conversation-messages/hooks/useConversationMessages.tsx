import { QueryHookOptions, useQuery } from '@apollo/client';
import { useAtomValue } from 'jotai';
import { useCallback, useEffect } from 'react';
import { currentUserState } from 'ui-modules';
import { GET_CONVERSATION_MESSAGES } from '@/inbox/conversations/conversation-detail/graphql/queries/getConversationMessages';
import {
  CONVERSATION_MESSAGE_INSERTED,
  CONVERSATION_MESSAGE_UPDATED,
} from '@/inbox/conversations/graphql/subscriptions/inboxSubscriptions';
import { IMessage } from '@/inbox/types/Conversation';

export const useConversationMessages = (
  options: QueryHookOptions<{
    conversationMessages: IMessage[];
    conversationMessagesTotalCount: number;
  }>,
  settings: { updateConversationPreview?: boolean } = {},
) => {
  const { updateConversationPreview = true } = settings;
  const currentUserId = useAtomValue(currentUserState)?._id || '';
  const pinnedOnly = Boolean(options.variables?.pinnedOnly);
  const { data, loading, fetchMore, subscribeToMore, client } = useQuery<{
    conversationMessages: IMessage[];
    conversationMessagesTotalCount: number;
  }>(GET_CONVERSATION_MESSAGES, options);

  const { conversationMessages, conversationMessagesTotalCount } = data || {
    conversationMessages: [],
    conversationMessagesTotalCount: 0,
  };

  const handleFetchMore = useCallback(async () => {
    if (
      loading ||
      conversationMessagesTotalCount <= conversationMessages.length
    ) {
      return false;
    }

    await fetchMore({
        variables: {
          skip: conversationMessages.length,
          limit: 10,
        },
        updateQuery: (prev, { fetchMoreResult }) => {
          if (!fetchMoreResult) return prev;

          return {
            conversationMessages: [
              ...fetchMoreResult.conversationMessages,
              ...prev.conversationMessages,
            ],
            conversationMessagesTotalCount:
              fetchMoreResult.conversationMessagesTotalCount,
          };
        },
      });
    return true;
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
        const matchesActiveFilters = (message: IMessage) =>
          !pinnedOnly || Boolean(message.pinnedByIds?.includes(currentUserId));

        // The same message id can be re-emitted to push an update (e.g. a Discord
        // poll's vote tallies refreshing on `extraData`). Replace the existing
        // copy in place so the card updates, rather than dropping the event as a
        // duplicate or appending a second bubble.
        const existingIndex = prev.conversationMessages.findIndex(
          (msg: IMessage) => msg._id === newMessage._id,
        );

        if (existingIndex !== -1) {
          const conversationMessages = [...prev.conversationMessages];
          const updatedMessage = {
            ...conversationMessages[existingIndex],
            ...newMessage,
          };
          if (!matchesActiveFilters(updatedMessage)) {
            conversationMessages.splice(existingIndex, 1);
            return {
              ...prev,
              conversationMessages,
              conversationMessagesTotalCount: Math.max(
                0,
                prev.conversationMessagesTotalCount - 1,
              ),
            };
          }
          conversationMessages[existingIndex] = updatedMessage;
          return { ...prev, conversationMessages };
        }

        if (!matchesActiveFilters(newMessage)) return prev;

        try {
          // Get the cache ID for the conversation
          const conversationId = client.cache.identify({
            __typename: 'Conversation',
            _id: options.variables?.conversationId,
          });

          if (
            updateConversationPreview &&
            conversationId &&
            !newMessage.internal
          ) {
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
  }, [
    client.cache,
    currentUserId,
    options.variables?.conversationId,
    pinnedOnly,
    subscribeToMore,
    updateConversationPreview,
  ]);

  // Read-state and other edits to existing messages arrive on their own
  // subscription. A message outside the loaded page is ignored — it must never
  // be appended or counted as a new insert.
  useEffect(() => {
    const unsubscribe = subscribeToMore<{
      conversationMessageUpdated: IMessage;
    }>({
      document: CONVERSATION_MESSAGE_UPDATED,
      variables: {
        _id: options.variables?.conversationId,
      },
      updateQuery: (prev, { subscriptionData }) => {
        if (!prev || !subscriptionData.data) return prev;

        const updated = subscriptionData.data.conversationMessageUpdated;
        const existingIndex = prev.conversationMessages.findIndex(
          (msg: IMessage) => msg._id === updated._id,
        );

        if (existingIndex === -1) return prev;

        const conversationMessages = [...prev.conversationMessages];
        conversationMessages[existingIndex] = {
          ...conversationMessages[existingIndex],
          ...updated,
        };
        return { ...prev, conversationMessages };
      },
    });
    return unsubscribe;
  }, [options.variables?.conversationId, subscribeToMore]);

  return {
    messages: conversationMessages,
    totalCount: conversationMessagesTotalCount,
    loading,
    handleFetchMore,
  };
};
