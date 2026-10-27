import { useQuery } from '@apollo/client';
import { GET_CONVERSATION_MESSAGES } from '@/integrations/instagram/graphql/queries/igConversationQueries';
import { useQueryState } from 'erxes-ui';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import { CONVERSATION_MESSAGE_INSERTED } from '@/inbox/conversations/graphql/subscriptions/inboxSubscriptions';
import { toMessage } from '@/inbox/conversation-messages/utils/toMessage';
import { compactList } from '@/shared/utils/cursorList';
import { isSameInstagramMessage } from '../utils/messageIdentity';

export const INSTAGRAM_CONVERSATION_MESSAGES_LIMIT = 20;

export const useInstagramConversationMessages = () => {
  const [conversationId] = useQueryState<string>('conversationId');
  const paginationRef = useRef({ fetching: false });
  useEffect(() => {
    paginationRef.current = { fetching: false };
  }, [conversationId]);

  const { data, loading, error, fetchMore, subscribeToMore, client } = useQuery(
    GET_CONVERSATION_MESSAGES,
    {
      variables: conversationId
        ? { conversationId, limit: INSTAGRAM_CONVERSATION_MESSAGES_LIMIT }
        : undefined,
      skip: !conversationId,
      fetchPolicy: 'cache-and-network',
      notifyOnNetworkStatusChange: true,
    },
  );
  const subscribeToMoreRef = useRef(subscribeToMore);
  useEffect(() => {
    subscribeToMoreRef.current = subscribeToMore;
  }, [subscribeToMore]);

  const instagramConversationMessages = useMemo(
    () =>
      data?.instagramConversationMessages
        ? compactList(data.instagramConversationMessages).map(toMessage)
        : undefined,
    [data?.instagramConversationMessages],
  );

  const totalCount = Math.max(
    data?.instagramConversationMessagesCount || 0,
    instagramConversationMessages?.length || 0,
  );

  const handleFetchMore = useCallback((): Promise<unknown> => {
    const loadedCount = instagramConversationMessages?.length || 0;
    const pagination = paginationRef.current;
    if (loading || pagination.fetching || totalCount <= loadedCount) {
      return Promise.resolve();
    }
    pagination.fetching = true;
    return fetchMore({
      variables: {
        skip: loadedCount,
      },
      updateQuery: (prev, { fetchMoreResult }) => {
        if (!fetchMoreResult) return prev;
        const previousMessages = compactList(
          prev.instagramConversationMessages,
        );
        const uniqueNewMessages = compactList(
          fetchMoreResult.instagramConversationMessages,
        ).filter(
          (message) =>
            !previousMessages.some((previous) =>
              isSameInstagramMessage(previous, message),
            ),
        );
        if (!uniqueNewMessages.length) {
          return prev;
        }
        return {
          instagramConversationMessages: [
            ...uniqueNewMessages,
            ...previousMessages,
          ],
          instagramConversationMessagesCount:
            fetchMoreResult.instagramConversationMessagesCount,
        };
      },
    }).finally(() => {
      pagination.fetching = false;
    });
  }, [fetchMore, instagramConversationMessages, loading, totalCount]);

  useEffect(() => {
    if (!conversationId) return;
    const unsubscribe = subscribeToMoreRef.current({
      document: CONVERSATION_MESSAGE_INSERTED,
      variables: { _id: conversationId },
      updateQuery: (prev, { subscriptionData }) => {
        const newMessage = subscriptionData.data?.conversationMessageInserted;

        if (!prev || !newMessage) return prev;

        const previousMessages = compactList(
          prev.instagramConversationMessages,
        );
        const messageExists = previousMessages.some((msg) =>
          isSameInstagramMessage(msg, newMessage),
        );

        if (messageExists) {
          return {
            ...prev,
            instagramConversationMessages: previousMessages.map((message) =>
              isSameInstagramMessage(message, newMessage)
                ? {
                    ...message,
                    ...newMessage,
                    _id: message._id,
                    mid: newMessage.mid || message.mid,
                    conversationId,
                    __typename: 'InstagramConversationMessage',
                  }
                : message,
            ),
          };
        }

        const oldestMessage = previousMessages[0];
        if (
          oldestMessage &&
          previousMessages.length <
            (prev.instagramConversationMessagesCount ?? 0) &&
          new Date(newMessage.createdAt ?? 0) <
            new Date(oldestMessage.createdAt ?? 0)
        )
          return prev;

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

        return {
          ...prev,
          instagramConversationMessages: [
            ...previousMessages,
            {
              ...newMessage,
              conversationId,
              __typename: 'InstagramConversationMessage',
            },
          ],
          instagramConversationMessagesCount:
            (prev.instagramConversationMessagesCount ?? 0) + 1,
        };
      },
    });
    return unsubscribe;
  }, [client.cache, conversationId]);

  return {
    instagramConversationMessages,
    totalCount,
    handleFetchMore,
    loading,
    error,
  };
};
