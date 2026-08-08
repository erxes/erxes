import { IconLoader } from '@tabler/icons-react';

import { ConversationContext } from '@/inbox/conversations/context/ConversationContext';
import { ConversationListContext } from '@/inbox/conversations/context/ConversationListContext';
import { IConversation } from '@/inbox/types/Conversation';
import { useConversations } from '@/inbox/conversations/hooks/useConversations';

import {
  EnumCursorDirection,
  EnumCursorMode,
  Filter,
  isUndefinedOrNull,
  parseDateRangeFromString,
  Separator,
  useNonNullMultiQueryState,
} from 'erxes-ui';

import { ConversationsHeader } from '@/inbox/conversations/components/ConversationsHeader';
import { CONVERSATIONS_LIMIT } from '@/inbox/constants/conversationsConstants';
import { ConversationItem } from './ConversationItem';
import { ConversationThreadList } from './ConversationChannelSection';
import { isDiscordConversation } from '@/inbox/conversations/utils/channelGroups';
import { useDiscordConversationChannels } from '@/integrations/discord/hooks/useDiscordSetup';
import {
  type UIEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useAtom, useAtomValue } from 'jotai';
import { refetchNewMessagesState } from '@/inbox/conversations/states/newMessagesCountState';
import { conversationsContainerScrollState } from '@/inbox/conversations/states/conversationsContainerScrollState';
import { ConversationActions } from './ConversationActions';

export const Conversations = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const refetchNewMessages = useAtomValue(refetchNewMessagesState);
  const [conversationsContainerScroll, setConversationsContainerScroll] =
    useAtom(conversationsContainerScrollState);
  const [rerendered, setRerendered] = useState(false);

  useEffect(() => {
    if (
      containerRef.current &&
      !isUndefinedOrNull(conversationsContainerScroll) &&
      !rerendered
    ) {
      containerRef.current.scrollTo({
        top: conversationsContainerScroll,
      });
      setConversationsContainerScroll(null);
    }
  }, [conversationsContainerScroll]);

  useEffect(() => {
    if (refetchNewMessages) {
      containerRef.current?.scrollTo({
        top: 0,
      });
    }
  }, [refetchNewMessages]);

  const {
    channelId,
    integrationId,
    integrationType,
    unassigned,
    status,
    created,
    brandId,
    searchValue,
  } = useNonNullMultiQueryState<{
    channelId: string;
    integrationId: string;
    integrationType: string;
    unassigned: string;
    status: string;
    conversationId: string;
    created: string;
    brandId: string;
    searchValue: string;
  }>([
    'channelId',
    'integrationId',
    'integrationType',
    'unassigned',
    'status',
    'conversationId',
    'created',
    'brandId',
    'searchValue',
  ]);

  const parsedDate = parseDateRangeFromString(created || '');

  const {
    totalCount,
    conversations,
    handleFetchMore,
    loading,
    loadingMore,
    pageInfo,
  } = useConversations({
    variables: {
      limit: CONVERSATIONS_LIMIT,
      channelId,
      integrationId,
      integrationType: integrationType,
      unassigned,
      status: status || '',
      startDate: parsedDate?.from,
      endDate: parsedDate?.to,
      brandId,
      searchValue,
      cursorMode: EnumCursorMode.INCLUSIVE,
    },
  });

  const loadNextPage = useCallback(() => {
    void handleFetchMore({
      direction: EnumCursorDirection.FORWARD,
    });
  }, [handleFetchMore]);

  const handleConversationListScroll = useCallback(
    (event: UIEvent<HTMLDivElement>) => {
      const { clientHeight, scrollHeight, scrollTop } = event.currentTarget;
      const distanceFromBottom = scrollHeight - scrollTop - clientHeight;

      if (
        distanceFromBottom <= 160 &&
        pageInfo?.hasNextPage &&
        !loading &&
        !loadingMore
      ) {
        loadNextPage();
      }
    },
    [loadNextPage, loading, loadingMore, pageInfo?.hasNextPage],
  );

  useEffect(() => {
    const container = containerRef.current;

    if (!container) {
      return;
    }

    const loadIfViewportIsUnderfilled = () => {
      if (
        !loading &&
        !loadingMore &&
        pageInfo?.hasNextPage &&
        conversations.length > 0 &&
        container.scrollHeight <= container.clientHeight
      ) {
        loadNextPage();
      }
    };

    loadIfViewportIsUnderfilled();

    const resizeObserver = new ResizeObserver(loadIfViewportIsUnderfilled);
    resizeObserver.observe(container);

    return () => resizeObserver.disconnect();
  }, [
    conversations.length,
    loadNextPage,
    loading,
    loadingMore,
    pageInfo?.hasNextPage,
  ]);

  const conversationListContextValue = useMemo(
    () => ({ conversations, loading, totalCount }),
    [conversations, loading, totalCount],
  );

  const discordConversationIds = useMemo(
    () =>
      (conversations || [])
        .filter(isDiscordConversation)
        .map((conversation) => conversation._id),
    [conversations],
  );
  const { channelMap, loading: channelInfoLoading } =
    useDiscordConversationChannels(discordConversationIds);

  const renderConversationItem = (conversation: IConversation) => (
    <ConversationContext.Provider
      key={conversation._id}
      value={{ ...conversation, tagIds: conversation.tagIds ?? [] }}
    >
      <ConversationItem
        channelInfo={channelMap.get(conversation._id)}
        channelInfoPending={
          channelInfoLoading &&
          isDiscordConversation(conversation) &&
          !channelMap.has(conversation._id)
        }
        onConversationSelect={() => {
          setConversationsContainerScroll(containerRef.current?.scrollTop || 0);
          setRerendered(true);
        }}
      />
    </ConversationContext.Provider>
  );

  return (
    <ConversationListContext.Provider value={conversationListContextValue}>
      <div className="flex h-full min-h-0 w-full flex-col overflow-hidden">
        <Filter id="conversations">
          <ConversationsHeader>
            <ConversationActions />
          </ConversationsHeader>
        </Filter>
        <Separator />
        <div
          className="min-h-0 w-full flex-1 overflow-y-auto"
          ref={containerRef}
          onScroll={handleConversationListScroll}
        >
          <ConversationThreadList
            conversations={conversations || []}
            threadMap={channelMap}
            renderItem={renderConversationItem}
          />
          {conversations.length > 0 && pageInfo?.hasNextPage && (
            <div className="flex h-8 w-full items-center justify-center gap-2 text-muted-foreground">
              {loadingMore && (
                <>
                  <IconLoader className="size-4 animate-spin" />
                  <span>loading more...</span>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </ConversationListContext.Provider>
  );
};
