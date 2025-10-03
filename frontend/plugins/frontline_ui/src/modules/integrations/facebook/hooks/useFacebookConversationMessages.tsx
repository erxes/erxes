import { useQuery } from '@apollo/client';
import { GET_CONVERSATION_MESSAGES } from '../graphql/queries/fbConversationQueries';
import { useQueryState } from 'erxes-ui';
import { IFacebookConversationMessage } from '../types/FacebookTypes';
import { useEffect } from 'react';
import { CONVERSATION_MESSAGE_INSERTED } from '@/inbox/conversations/graphql/subscriptions/inboxSubscriptions';

export interface IFacebookConversationMessagesQuery {
  facebookConversationMessages: IFacebookConversationMessage[];
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

        // Check if the message already exists to prevent duplicates
        const messageExists = prev.facebookConversationMessages.some(
          (msg: IFacebookConversationMessage) => msg._id === newMessage._id,
        );

        if (messageExists) return prev;

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
            ...prev.facebookConversationMessages,
            {
              ...newMessage,
              conversationId,
              __typename: 'FacebookConversationMessage',
            },
          ],
        };
      },
    });
    return unsubscribe;
  }, [conversationId]);

  return {
    facebookConversationMessages,
    handleFetchMore,
    loading,
    error,
  };
};
