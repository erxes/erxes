import { ConversationStatus } from '@/inbox/types/Conversation';
import { GET_CONVERSATIONS } from '@/inbox/conversations/graphql/queries/getConversations';
import { useQuery } from '@apollo/client';
import type { QueryHookOptions } from '@apollo/client';
import {
  EnumCursorDirection,
  EnumCursorMode,
  isUndefinedOrNull,
  parseDateRangeFromString,
  useNonNullMultiQueryState,
  useToast,
  validateFetchMore,
} from 'erxes-ui';
import {
  compactList,
  mergeCursorList,
  toCursorPageInfo,
} from '@/shared/utils/cursorList';
import type {
  ConversationsQuery,
  ConversationsQueryVariables,
} from '~/gql/graphql';
import { CONVERSATIONS_LIMIT } from '@/inbox/constants/conversationsConstants';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { CONVERSATION_CLIENT_MESSAGE_INSERTED } from '@/inbox/conversations/graphql/subscriptions/inboxSubscriptions';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { currentUserState } from 'ui-modules';
import { useNotificationSound } from '@/inbox/conversations/hooks/useNotificationSound';
import {
  newMessagesCountState,
  resetNewMessagesState,
} from '@/inbox/conversations/states/newMessagesCountState';
import { refetchConversationsAtom } from '@/inbox/conversations/states/refetchConversationState';
import { activeConversationState } from '@/inbox/conversations/states/activeConversationState';
import { conversationsContainerScrollState } from '@/inbox/conversations/states/conversationsContainerScrollState';
import { useTranslation } from 'react-i18next';
import {
  CONVERSATION_FETCH_MORE_THRESHOLD,
  INBOX_CONVERSATION_QUERY_KEYS,
} from '@/inbox/conversations/constants/useConversations';
import type { InboxConversationQueryState } from '@/inbox/conversations/types/useConversations';
import {
  compareConversationsByRecency,
  getBooleanFilterVariable,
  getConversationRecency,
  getDateFilterVariable,
} from '@/inbox/conversations/utils/useConversations';

export const useConversations = (
  options?: QueryHookOptions<ConversationsQuery, ConversationsQueryVariables>,
) => {
  const {
    channelId,
    integrationId,
    integrationType,
    unassigned,
    awaitingResponse,
    withSurvey,
    automationStatus,
    participating,
    participated,
    mentioned,
    unread,
    status,
    created,
    brandId,
    searchValue,
  } = useNonNullMultiQueryState<InboxConversationQueryState>(
    INBOX_CONVERSATION_QUERY_KEYS,
  );
  const parsedDate = parseDateRangeFromString(created || '');

  const filterVariables = useMemo(
    () => ({
      limit: CONVERSATIONS_LIMIT,
      channelId,
      integrationId,
      integrationType,
      unassigned: getBooleanFilterVariable(unassigned),
      awaitingResponse: getBooleanFilterVariable(awaitingResponse),
      withSurvey: getBooleanFilterVariable(withSurvey),
      automationStatus,
      participating: getBooleanFilterVariable(participating || participated),
      mentioned: getBooleanFilterVariable(mentioned),
      unread: getBooleanFilterVariable(unread),
      status: status || '',
      startDate: getDateFilterVariable(parsedDate?.from),
      endDate: getDateFilterVariable(parsedDate?.to),
      brandId,
      searchValue,
      cursorMode: EnumCursorMode.INCLUSIVE,
    }),
    [
      channelId,
      integrationId,
      integrationType,
      unassigned,
      awaitingResponse,
      withSurvey,
      automationStatus,
      participating,
      participated,
      mentioned,
      unread,
      status,
      parsedDate?.from,
      parsedDate?.to,
      brandId,
      searchValue,
    ],
  );

  const variables = options?.variables ?? filterVariables;
  const ownsInboxState = !options;

  const { data, fetchMore, subscribeToMore, loading, refetch } = useQuery(
    GET_CONVERSATIONS,
    {
      // The list unmounts in conversation detail. Refresh on returning so events
      // received while it was absent cannot leave a stale preview or hide a chat.
      fetchPolicy: 'cache-and-network',
      ...options,
      variables,
    },
  );
  const refetchRef = useRef(refetch);
  refetchRef.current = refetch;
  const { _id: userId } = useAtomValue(currentUserState) || {};

  const { conversations } = data || {};
  const totalCount = conversations?.totalCount ?? 0;
  const pageInfo = toCursorPageInfo(conversations?.pageInfo);
  const sortedList = useMemo(
    () => compactList(conversations?.list).sort(compareConversationsByRecency),
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
  const subscribeToMoreRef = useRef(subscribeToMore);
  subscribeToMoreRef.current = subscribeToMore;
  const playNotificationSoundRef = useRef(playNotificationSound);
  playNotificationSoundRef.current = playNotificationSound;
  const pendingRefetchRef = useRef(false);
  const variablesKey = useMemo(() => JSON.stringify(variables), [variables]);

  const scheduleRefetch = useCallback(() => {
    if (pendingRefetchRef.current) {
      return;
    }

    pendingRefetchRef.current = true;
    setTimeout(() => {
      pendingRefetchRef.current = false;
      refetchRef.current().catch(() => undefined);
    }, 0);
  }, []);
  const { t } = useTranslation('frontline');
  const { toast } = useToast();
  const containerRef = useRef<HTMLDivElement>(null);
  const fetchingMoreRef = useRef(false);
  const lastAutoFetchCursorRef = useRef<string | null>(null);
  const [fetchingMore, setFetchingMore] = useState(false);
  const [conversationSelected, setConversationSelected] = useState(false);
  const [storedScrollPosition, setStoredScrollPosition] = useAtom(
    conversationsContainerScrollState,
  );

  useEffect(() => {
    if (!ownsInboxState) {
      return;
    }

    setRefetch(() => refetch);
  }, [ownsInboxState, refetch, setRefetch]);

  useEffect(() => {
    if (!ownsInboxState || !refetchNewMessages) {
      return;
    }

    refetch();
    resetNewMessagesStates();
  }, [ownsInboxState, refetch, refetchNewMessages, resetNewMessagesStates]);

  const handleFetchMore = useCallback(
    async ({ direction }: { direction: EnumCursorDirection }) => {
      if (!validateFetchMore({ direction, pageInfo })) {
        return;
      }

      await fetchMore({
        variables: {
          cursor:
            direction === EnumCursorDirection.FORWARD
              ? pageInfo?.endCursor
              : pageInfo?.startCursor,
          limit: CONVERSATIONS_LIMIT,
        },
        updateQuery: (prev, { fetchMoreResult }) => {
          if (!fetchMoreResult.conversations || !prev.conversations) {
            return prev;
          }
          return {
            ...prev,
            conversations: mergeCursorList(
              direction,
              prev.conversations,
              fetchMoreResult.conversations,
            ),
          };
        },
      });
    },
    [fetchMore, pageInfo],
  );

  useEffect(() => {
    if (!userId) {
      return;
    }

    const unsubscribe = subscribeToMoreRef.current({
      document: CONVERSATION_CLIENT_MESSAGE_INSERTED,
      variables: {
        userId,
      },
      updateQuery: (prev, { subscriptionData }) => {
        const newMessage =
          subscriptionData.data?.conversationClientMessageInserted;

        if (newMessage?.internal) return prev;
        if (!newMessage) {
          scheduleRefetch();
          return prev;
        }

        if (ownsInboxState) {
          setNewMessagesCount((prev) => prev + 1);

          if (
            newMessage.conversationId !== activeConversationRef.current?._id
          ) {
            playNotificationSoundRef.current();
          }
        }

        const conversationId = newMessage.conversationId;
        const list = compactList(prev?.conversations?.list);
        const index = list.findIndex(
          (conversation) => conversation._id === conversationId,
        );
        // Not in the list yet, or nothing to order it by — let the server say.
        if (!prev?.conversations || index === -1 || !newMessage.createdAt) {
          scheduleRefetch();
          return prev;
        }

        const [conversation] = list.splice(index, 1);
        const previousMessageTime = Date.parse(
          conversation.lastMessage?.createdAt || conversation.createdAt || '',
        );
        const isLatestMessage =
          Date.parse(newMessage.createdAt) >=
          (Number.isNaN(previousMessageTime) ? 0 : previousMessageTime);
        list.unshift({
          ...conversation,
          readUserIds:
            conversation.readUserIds?.filter((id) => id !== userId) ?? null,
          status: ConversationStatus.OPEN,
          content: isLatestMessage ? newMessage.content : conversation.content,
          lastMessage: isLatestMessage ? newMessage : conversation.lastMessage,
          // Events can arrive out of order; recency must never move backwards.
          updatedAt:
            Date.parse(newMessage.createdAt) >=
            getConversationRecency(conversation)
              ? newMessage.createdAt
              : conversation.updatedAt,
        });

        return { ...prev, conversations: { ...prev.conversations, list } };
      },
    });

    return () => {
      unsubscribe();
    };
  }, [
    ownsInboxState,
    scheduleRefetch,
    setNewMessagesCount,
    userId,
    variablesKey,
  ]);

  useEffect(() => {
    if (conversationSelected) {
      setConversationSelected(false);
      return;
    }

    const container = containerRef.current;

    if (
      container &&
      !loading &&
      sortedList.length > 0 &&
      !isUndefinedOrNull(storedScrollPosition)
    ) {
      container.scrollTo({
        top: storedScrollPosition,
      });
      setStoredScrollPosition(null);
    }
  }, [
    conversationSelected,
    loading,
    setStoredScrollPosition,
    sortedList.length,
    storedScrollPosition,
  ]);

  useEffect(() => {
    if (refetchNewMessages) {
      containerRef.current?.scrollTo({
        top: 0,
      });
    }
  }, [refetchNewMessages]);

  const isNearBottom = useCallback(() => {
    const container = containerRef.current;

    if (!container) {
      return false;
    }

    return (
      container.scrollHeight - container.scrollTop - container.clientHeight <=
      CONVERSATION_FETCH_MORE_THRESHOLD
    );
  }, []);

  const fetchNextPage = useCallback(async () => {
    if (fetchingMoreRef.current || loading || !pageInfo?.hasNextPage) {
      return;
    }

    fetchingMoreRef.current = true;
    setFetchingMore(true);

    try {
      await handleFetchMore({
        direction: EnumCursorDirection.FORWARD,
      });
    } catch (error) {
      toast({
        title: t('something-went-wrong', 'Uh oh! Something went wrong.'),
        description: error instanceof Error ? error.message : undefined,
        variant: 'destructive',
      });
    } finally {
      fetchingMoreRef.current = false;
      setFetchingMore(false);
    }
  }, [handleFetchMore, loading, pageInfo?.hasNextPage, t, toast]);

  useEffect(() => {
    const endCursor = pageInfo?.endCursor;

    if (
      loading ||
      !pageInfo?.hasNextPage ||
      !endCursor ||
      lastAutoFetchCursorRef.current === endCursor ||
      !isNearBottom()
    ) {
      return;
    }

    lastAutoFetchCursorRef.current = endCursor;
    void fetchNextPage();
  }, [
    fetchNextPage,
    isNearBottom,
    loading,
    pageInfo?.endCursor,
    pageInfo?.hasNextPage,
  ]);

  const handleScroll = useCallback(() => {
    if (isNearBottom()) {
      void fetchNextPage();
    }
  }, [fetchNextPage, isNearBottom]);

  const handleConversationSelect = useCallback(() => {
    setStoredScrollPosition(containerRef.current?.scrollTop || 0);
    setConversationSelected(true);
  }, [setStoredScrollPosition]);

  return {
    totalCount,
    conversations: sortedList,
    loading,
    handleFetchMore,
    pageInfo,
    containerRef,
    fetchingMore,
    handleConversationSelect,
    handleScroll,
  };
};
