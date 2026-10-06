import { useQuery } from '@apollo/client';
import { useEffect } from 'react';
import type { IMessage } from '@/inbox/types/Conversation';
import { GET_CONVERSATION_PINNED_MESSAGES } from '@/inbox/conversations/conversation-detail/graphql/queries/getConversationPinnedMessages';
import {
  CONVERSATION_MESSAGE_INSERTED,
  CONVERSATION_MESSAGE_UPDATED,
} from '@/inbox/conversations/graphql/subscriptions/inboxSubscriptions';

export const useConversationPinnedMessages = (conversationId: string) => {
  const { data, loading, error, refetch, subscribeToMore } = useQuery<{
    conversationPinnedMessages: IMessage[];
  }>(GET_CONVERSATION_PINNED_MESSAGES, {
    variables: { conversationId },
    fetchPolicy: 'cache-and-network',
  });

  useEffect(() => {
    const unsubscribes = [
      CONVERSATION_MESSAGE_INSERTED,
      CONVERSATION_MESSAGE_UPDATED,
    ].map((document) =>
      subscribeToMore<{
        conversationMessageInserted?: IMessage;
        conversationMessageUpdated?: IMessage;
      }>({
        document,
        variables: { _id: conversationId },
        updateQuery: (previous, { subscriptionData }) => {
          const message =
            subscriptionData.data?.conversationMessageInserted ||
            subscriptionData.data?.conversationMessageUpdated;
          if (
            !previous?.conversationPinnedMessages ||
            !message ||
            message.conversationId !== conversationId
          ) {
            return previous;
          }
          const messages = previous.conversationPinnedMessages.filter(
            ({ _id }) => _id !== message._id,
          );
          if (
            message.extraData?.discordPinned &&
            !message.extraData.discordDeletedAt
          )
            messages.push(message);
          return {
            conversationPinnedMessages: messages.sort((a, b) =>
              b.createdAt.localeCompare(a.createdAt),
            ),
          };
        },
      }),
    );
    return () => unsubscribes.forEach((unsubscribe) => unsubscribe());
  }, [conversationId, subscribeToMore]);

  return {
    messages: data?.conversationPinnedMessages || [],
    loading,
    error,
    refetch,
  };
};
