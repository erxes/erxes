import { useQuery } from '@apollo/client';
import { useEffect, useMemo } from 'react';
import { GET_CONVERSATION_PINNED_MESSAGES } from '@/inbox/conversations/conversation-detail/graphql/queries/getConversationPinnedMessages';
import {
  CONVERSATION_MESSAGE_INSERTED,
  CONVERSATION_MESSAGE_UPDATED,
} from '@/inbox/conversations/graphql/subscriptions/inboxSubscriptions';
import { toMessage } from '@/inbox/conversation-messages/utils/toMessage';
import { compactList } from '@/shared/utils/cursorList';
import type {
  FrontlineConversationMessageFieldsFragment,
  FrontlineConversationPinnedMessagesQuery,
} from '~/gql/graphql';

const applyPinnedChange = (
  previous: FrontlineConversationPinnedMessagesQuery,
  conversationId: string,
  message?: FrontlineConversationMessageFieldsFragment | null,
): FrontlineConversationPinnedMessagesQuery => {
  if (
    !previous?.conversationPinnedMessages ||
    !message ||
    message.conversationId !== conversationId
  ) {
    return previous;
  }
  const messages = compactList(previous.conversationPinnedMessages).filter(
    ({ _id }) => _id !== message._id,
  );
  const { extraData } = toMessage(message);
  if (extraData?.discordPinned && !extraData.discordDeletedAt)
    messages.push(message);
  return {
    conversationPinnedMessages: messages.sort((a, b) =>
      (b.createdAt ?? '').localeCompare(a.createdAt ?? ''),
    ),
  };
};

export const useConversationPinnedMessages = (conversationId: string) => {
  const { data, loading, error, refetch, subscribeToMore } = useQuery(
    GET_CONVERSATION_PINNED_MESSAGES,
    {
      variables: { conversationId },
      fetchPolicy: 'cache-and-network',
    },
  );

  useEffect(() => {
    const unsubscribes = [
      subscribeToMore({
        document: CONVERSATION_MESSAGE_INSERTED,
        variables: { _id: conversationId },
        updateQuery: (previous, { subscriptionData }) =>
          applyPinnedChange(
            previous,
            conversationId,
            subscriptionData.data?.conversationMessageInserted,
          ),
      }),
      subscribeToMore({
        document: CONVERSATION_MESSAGE_UPDATED,
        variables: { _id: conversationId },
        updateQuery: (previous, { subscriptionData }) =>
          applyPinnedChange(
            previous,
            conversationId,
            subscriptionData.data?.conversationMessageUpdated,
          ),
      }),
    ];
    return () => unsubscribes.forEach((unsubscribe) => unsubscribe());
  }, [conversationId, subscribeToMore]);

  const messages = useMemo(
    () => compactList(data?.conversationPinnedMessages).map(toMessage),
    [data?.conversationPinnedMessages],
  );

  return {
    messages,
    loading,
    error,
    refetch,
  };
};
