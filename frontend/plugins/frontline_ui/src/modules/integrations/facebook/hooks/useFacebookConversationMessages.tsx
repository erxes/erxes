import { useQuery } from '@apollo/client';
import { GET_CONVERSATION_MESSAGES } from '@/integrations/facebook/graphql/queries/fbConversationQueries';
import { useQueryState } from 'erxes-ui';
import type { IFacebookConversationMessage } from '@/integrations/facebook/types/FacebookTypes';
import { useEffect } from 'react';
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

  const handleFetchMore = () => {
    if (
      facebookConversationMessages?.length &&
      facebookConversationMessages?.length %
        FACEBOOK_CONVERSATION_MESSAGES_LIMIT ===
        0
    ) {
      fetchMore({
        variables: {
          skip: data?.facebookConversationMessages?.length || 0,
        },
        updateQuery: (prev, { fetchMoreResult }) => {
          if (!fetchMoreResult) {
            return prev;
          }
          return {
            facebookConversationMessages: [
              ...fetchMoreResult.facebookConversationMessages,
              ...prev.facebookConversationMessages,
            ],
            facebookConversationMessagesCount:
              fetchMoreResult.facebookConversationMessagesCount,
          };
        },
      });
    }
  };

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
    totalCount: Math.max(
      data?.facebookConversationMessagesCount || 0,
      facebookConversationMessages?.length || 0,
    ),
    handleFetchMore,
    loading,
    error,
  };
};
