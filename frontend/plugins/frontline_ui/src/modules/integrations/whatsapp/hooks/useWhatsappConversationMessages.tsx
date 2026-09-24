import { useEffect } from 'react';
import { useQuery } from '@apollo/client';
import { useQueryState } from 'erxes-ui';
import { CONVERSATION_MESSAGE_INSERTED } from '@/inbox/conversations/graphql/subscriptions/inboxSubscriptions';
import {
  GET_WHATSAPP_CONVERSATION_MESSAGES,
  GET_WHATSAPP_CONVERSATION_MESSAGES_COUNT,
} from '../graphql/queries/whatsappConversationQueries';
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

  const {
    data,
    loading,
    error,
    fetchMore,
    subscribeToMore,
    client,
    refetch: refetchMessages,
  } = useQuery<
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

  const {
    data: countData,
    error: countError,
    refetch: refetchCount,
  } = useQuery<{ whatsappConversationMessagesCount: number }>(
    GET_WHATSAPP_CONVERSATION_MESSAGES_COUNT,
    {
      variables: { conversationId: conversationId || '' },
      skip: !conversationId,
    },
  );

  const { whatsappConversationMessages } = data || {};

  const totalCount = Math.max(
    countData?.whatsappConversationMessagesCount ?? 0,
    whatsappConversationMessages?.length ?? 0,
  );

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

  const refetch = () => Promise.all([refetchMessages(), refetchCount()]);

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

        const newMessageCreatedAt = new Date(newMessage.createdAt).getTime();

        const messageExists = prev.whatsappConversationMessages.some(
          (message) =>
            message._id === newMessage._id ||
            (!newMessage.internal &&
              message.content === newMessage.content &&
              new Date(message.createdAt).getTime() === newMessageCreatedAt),
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
        } catch {
          // ignore cache write failures; the message still renders
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
    totalCount,
    loading,
    error: error || countError,
    refetch,
  };
};
