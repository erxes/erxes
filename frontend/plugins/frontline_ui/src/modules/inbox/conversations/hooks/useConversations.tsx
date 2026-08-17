import { GET_CONVERSATIONS } from '@/inbox/conversations/graphql/queries/getConversations';
import { QueryHookOptions, useQuery } from '@apollo/client';
import { ConversationStatus, IConversation } from '../../types/Conversation';
import {
  EnumCursorDirection,
  ICursorListResponse,
  mergeCursorData,
  validateFetchMore,
} from 'erxes-ui';
import { CONVERSATIONS_LIMIT } from '@/inbox/constants/conversationsConstants';
import { useEffect, useMemo, useRef } from 'react';
import { CONVERSATION_CLIENT_MESSAGE_INSERTED } from '../graphql/subscriptions/inboxSubscriptions';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { currentUserState } from 'ui-modules';
import { useNotificationSound } from './useNotificationSound';
import {
  newMessagesCountState,
  resetNewMessagesState,
} from '@/inbox/conversations/states/newMessagesCountState';
import { refetchConversationsAtom } from '../states/refetchConversationState';
import { activeConversationState } from '../states/activeConversationState';

const getRecency = (conversation: IConversation) => {
  const time = Date.parse(conversation.updatedAt || conversation.createdAt);
  return Number.isNaN(time) ? 0 : time;
};

// Live cache writes only patch fields, so re-apply the server's order
// (updatedAt desc, ascending _id) to keep the newest conversation on top.
const compareByRecency = (a: IConversation, b: IConversation) =>
  getRecency(b) - getRecency(a) || a._id.localeCompare(b._id);

export const useConversations = (
  options?: QueryHookOptions<ICursorListResponse<IConversation>>,
) => {
  const { data, fetchMore, subscribeToMore, loading, refetch } = useQuery<
    ICursorListResponse<IConversation>
  >(GET_CONVERSATIONS, options);
  const refetchRef = useRef(refetch);
  refetchRef.current = refetch;
  const { _id: userId } = useAtomValue(currentUserState) || {};

  const { conversations } = data || {};
  const { totalCount = 0, pageInfo } = conversations || {};
  const sortedList = useMemo(
    () => [...(conversations?.list ?? [])].sort(compareByRecency),
    [conversations?.list],
  );
  const setNewMessagesCount = useSetAtom(newMessagesCountState);
  const [refetchNewMessages, resetNewMessagesStates] = useAtom(
    resetNewMessagesState,
  );
  const setRefetch = useSetAtom(refetchConversationsAtom);
  const { play: playNotificationSound } = useNotificationSound();
  const activeConversation = useAtomValue(activeConversationState);
  const activeConversationRef = useRef(activeConversation);
  activeConversationRef.current = activeConversation;

  useEffect(() => {
    setRefetch(() => refetch);
  }, [refetch, setRefetch]);

  useEffect(() => {
    if (refetchNewMessages) {
      refetch();
      resetNewMessagesStates();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refetchNewMessages]);

  const handleFetchMore = ({
    direction,
  }: {
    direction: EnumCursorDirection;
  }) => {
    if (!validateFetchMore({ direction, pageInfo })) {
      return;
    }

    fetchMore({
      variables: {
        cursor:
          direction === EnumCursorDirection.FORWARD
            ? pageInfo?.endCursor
            : pageInfo?.startCursor,
        limit: CONVERSATIONS_LIMIT,
      },
      updateQuery: (prev, { fetchMoreResult }) => {
        if (!fetchMoreResult) return prev;
        return Object.assign({}, prev, {
          conversations: mergeCursorData({
            direction,
            fetchMoreResult: fetchMoreResult.conversations,
            prevResult: prev.conversations,
          }),
        });
      },
    });
  };

  useEffect(() => {
    const unsubscribe = subscribeToMore<{
      conversationClientMessageInserted: {
        _id: string;
        conversationId: string;
        content: string;
        createdAt: string;
      };
    }>({
      document: CONVERSATION_CLIENT_MESSAGE_INSERTED,
      variables: {
        userId,
      },
      updateQuery: (prev, { subscriptionData }) => {
        if (subscriptionData.data) {
          setNewMessagesCount((prev) => prev + 1);
          const incomingConversationId =
            subscriptionData.data.conversationClientMessageInserted
              .conversationId;
          if (incomingConversationId !== activeConversationRef.current?._id) {
            playNotificationSound();
          }
        }
        if (!subscriptionData.data || !prev) return prev;
        if (!prev.conversations) return prev;
        const newMessage =
          subscriptionData.data.conversationClientMessageInserted;
        const conversationId = newMessage?.conversationId;
        const index = prev.conversations.list.findIndex(
          (conversation) => conversation._id === conversationId,
        );
        // Not in the list yet, or nothing to order it by — let the server say.
        if (index === -1 || !newMessage.createdAt) {
          setTimeout(() => refetchRef.current(), 0);
          return prev;
        }

        const list = [...prev.conversations.list];
        const [conversation] = list.splice(index, 1);
        list.unshift({
          ...conversation,
          readUserIds: conversation.readUserIds?.filter((id) => id !== userId),
          status: ConversationStatus.OPEN,
          content: newMessage.content,
          // Events can arrive out of order; recency must never move backwards.
          updatedAt:
            Date.parse(newMessage.createdAt) >= getRecency(conversation)
              ? newMessage.createdAt
              : conversation.updatedAt,
        });

        return { ...prev, conversations: { ...prev.conversations, list } };
      },
    });

    return () => {
      unsubscribe();
    };
  }, [playNotificationSound, setNewMessagesCount, subscribeToMore, userId]);

  return {
    totalCount,
    conversations: sortedList,
    loading,
    handleFetchMore,
    pageInfo,
  };
};
