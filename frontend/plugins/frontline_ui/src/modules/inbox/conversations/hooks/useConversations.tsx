import { GET_CONVERSATIONS } from '@/inbox/conversations/graphql/queries/getConversations';
import { QueryHookOptions, useQuery } from '@apollo/client';
import { IConversation } from '../../types/Conversation';
import {
  EnumCursorDirection,
  ICursorListResponse,
  mergeCursorData,
  validateFetchMore,
} from 'erxes-ui';
import { CONVERSATIONS_LIMIT } from '@/inbox/constants/conversationsConstants';
import { useEffect } from 'react';
import { CONVERSATION_CLIENT_MESSAGE_INSERTED } from '../graphql/subscriptions/inboxSubscriptions';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { currentUserState } from 'ui-modules';
import {
  newMessagesCountState,
  resetNewMessagesState,
} from '@/inbox/conversations/states/newMessagesCountState';

export const useConversations = (
  options?: QueryHookOptions<ICursorListResponse<IConversation>>,
) => {
  const { data, fetchMore, subscribeToMore, loading, refetch } = useQuery<
    ICursorListResponse<IConversation>
  >(GET_CONVERSATIONS, options);
  const { _id: userId } = useAtomValue(currentUserState) || {};

  const { conversations } = data || {};
  const { list = [], totalCount = 0, pageInfo } = conversations || {};
  const setNewMessagesCount = useSetAtom(newMessagesCountState);
  const [refetchNewMessages, resetNewMessagesStates] = useAtom(
    resetNewMessagesState,
  );

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
      conversationClientMessageInserted: IConversation;
    }>({
      document: CONVERSATION_CLIENT_MESSAGE_INSERTED,
      variables: {
        userId,
      },
      updateQuery: (prev, { subscriptionData }) => {
        if (subscriptionData.data) {
          setNewMessagesCount((prev) => prev + 1);
        }
        return prev;
        // if (!subscriptionData.data || !prev) return prev;
        // const newMessage =
        //   subscriptionData.data.conversationClientMessageInserted;
        // const index = prev.conversations.list.findIndex(
        //   (conversation) => conversation._id === newMessage._id,
        // );
        // const list = [...prev.conversations.list];
        // if (index === -1) {
        //   list.unshift(newMessage);
        // } else {
        //   list.splice(index, 1, {
        //     ...list[index],
        //     readUserIds: list[index].readUserIds?.filter((id) => id !== userId),
        //     status: ConversationStatus.OPEN,
        //     content: newMessage.content,
        //   });
        // }
        // return { ...prev, conversations: { ...prev.conversations, list } };
      },
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return {
    totalCount,
    conversations: list,
    loading,
    handleFetchMore,
    pageInfo,
  };
};
