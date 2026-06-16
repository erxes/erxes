import { useQuery } from '@apollo/client';
import { useEffect } from 'react';
import { useQueryState } from 'erxes-ui';
import { CONVERSATION_MESSAGE_INSERTED } from '@/inbox/conversations/graphql/subscriptions/inboxSubscriptions';
import { GET_WHATSAPP_CONVERSATION_MESSAGES } from '../graphql/queries/whatsappConversationQueries';
import { IWhatsappConversationMessage } from '../types/WhatsappTypes';

export interface IWhatsappConversationMessagesQuery {
  whatsappConversationMessages: IWhatsappConversationMessage[];
}

export interface IWhatsappConversationMessagesQueryVariables {
  _id?: string;
  conversationId?: string;
  limit?: number;
  skip?: number;
  getFirst?: boolean;
}

export const WHATSAPP_CONVERSATION_MESSAGES_LIMIT = 20;

export const useWhatsappConversationMessages = () => {
  const [conversationId] = useQueryState<string>('conversationId');

  const { data, loading, error, fetchMore, subscribeToMore, client } = useQuery<
    IWhatsappConversationMessagesQuery,
    IWhatsappConversationMessagesQueryVariables
  >(GET_WHATSAPP_CONVERSATION_MESSAGES, {
    variables: {
      conversationId: conversationId || '',
      limit: WHATSAPP_CONVERSATION_MESSAGES_LIMIT,
    },
    skip: !conversationId,
    fetchPolicy: 'cache-and-network',
  });

  const { whatsappConversationMessages } = data || {};

  const handleFetchMore = () => {
    if (
      whatsappConversationMessages?.length &&
      whatsappConversationMessages?.length %
        WHATSAPP_CONVERSATION_MESSAGES_LIMIT ===
        0
    ) {
      fetchMore({
        variables: {
          skip: data?.whatsappConversationMessages?.length || 0,
        },
        updateQuery: (prev, { fetchMoreResult }) => {
          if (!fetchMoreResult) {
            return prev;
          }

          return {
            whatsappConversationMessages: [
              ...fetchMoreResult.whatsappConversationMessages,
              ...prev.whatsappConversationMessages,
            ],
          };
        },
      });
    }
  };

  useEffect(() => {
    if (!conversationId) {
      return;
    }

    const unsubscribe = subscribeToMore<{
      conversationMessageInserted: IWhatsappConversationMessage;
    }>({
      document: CONVERSATION_MESSAGE_INSERTED,
      variables: { _id: conversationId || '' },
      updateQuery: (prev, { subscriptionData }) => {
        if (!prev || !subscriptionData.data) {
          return prev;
        }

        const newMessage = subscriptionData.data.conversationMessageInserted;

        const messageExists = prev.whatsappConversationMessages.some(
          (message) => message._id === newMessage._id,
        );

        if (messageExists) {
          return prev;
        }

        try {
          const conversationCacheId = client.cache.identify({
            __typename: 'Conversation',
            _id: conversationId,
          });

          if (conversationCacheId && !newMessage.internal) {
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
          whatsappConversationMessages: [
            ...prev.whatsappConversationMessages,
            {
              ...newMessage,
              conversationId,
              __typename: 'WhatsappConversationMessage',
            },
          ],
        };
      },
    });

    return unsubscribe;
  }, [client.cache, conversationId, subscribeToMore]);

  return {
    whatsappConversationMessages,
    handleFetchMore,
    loading,
    error,
  };
};
