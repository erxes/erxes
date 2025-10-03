import { QueryHookOptions } from '@apollo/client';

import { useQuery } from '@apollo/client';
import { GET_CONVERSATION_MESSAGES } from '../../conversations/conversation-detail/graphql/queries/getConversationMessages';
import { useEffect } from 'react';
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

  const handleFetchMore = () => {
    if (
      !loading ||
      conversationMessagesTotalCount > conversationMessages.length
    ) {
      fetchMore({
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
    }
  };

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

        // Check if the message already exists to prevent duplicates
        const messageExists = prev.conversationMessages.some(
          (msg: IMessage) => msg._id === newMessage._id,
        );

        if (messageExists) return prev;

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
