import { useInView } from 'react-intersection-observer';
import { IconLoader } from '@tabler/icons-react';

import { ConversationContext } from '@/inbox/conversations/context/ConversationContext';
import { ConversationListContext } from '@/inbox/conversations/context/ConversationListContext';
import { IConversation } from '@/inbox/types/Conversation';
import { useConversations } from '@/inbox/conversations/hooks/useConversations';

import {
  Button,
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
import { useEffect, useMemo, useRef, useState } from 'react';
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

  const [ref] = useInView({
    onChange(inView) {
      if (inView) {
        handleFetchMore({
          direction: EnumCursorDirection.FORWARD,
        });
      }
    },
  });

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
  } = useNonNullMultiQueryState<{
    channelId: string;
    integrationId: string;
    integrationType: string;
    unassigned: string;
    status: string;
    conversationId: string;
    created: string;
    brandId: string;
  }>([
    'channelId',
    'integrationId',
    'integrationType',
    'unassigned',
    'status',
    'conversationId',
    'created',
    'brandId',
  ]);

  const parsedDate = parseDateRangeFromString(created || '');

  const { totalCount, conversations, handleFetchMore, loading, pageInfo } =
    useConversations({
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
        cursorMode: EnumCursorMode.INCLUSIVE,
      },
    });

  const conversationListContextValue = useMemo(
    () => ({ conversations, loading, totalCount }),
    [conversations, loading, totalCount],
  );

  // Resolve thread/channel metadata for the loaded Discord conversations so the
  // list can nest threads under their parent channel and show the channel as the
  // profile in group mode. Only Discord ids are sent, so non-Discord inboxes
  // never trigger the query.
  const discordConversationIds = useMemo(
    () =>
      (conversations || [])
        .filter(isDiscordConversation)
        .map((conversation) => conversation._id),
    [conversations],
  );
  const threadMap = useDiscordConversationChannels(discordConversationIds);

  const renderConversationItem = (conversation: IConversation) => (
    <ConversationContext.Provider
      key={conversation._id}
      value={{ ...conversation, tagIds: conversation.tagIds ?? [] }}
    >
      <ConversationItem
        channelInfo={threadMap.get(conversation._id)}
        onConversationSelect={() => {
          setConversationsContainerScroll(containerRef.current?.scrollTop || 0);
          setRerendered(true);
        }}
      />
    </ConversationContext.Provider>
  );

  return (
    <ConversationListContext.Provider value={conversationListContextValue}>
      <div className="flex flex-col h-full overflow-hidden w-full">
        <Filter id="conversations">
          <ConversationsHeader>
            <ConversationActions />
          </ConversationsHeader>
        </Filter>
        <Separator />
        <div className="h-full w-full overflow-y-auto" ref={containerRef}>
          {/* The inbox renders a flat conversation list. Per-channel selection
              lives in the sidebar's "Discord Channels" section (sets
              `integrationId`); when a channel is selected the list is already
              server-side isolated to it. Threads still nest under their parent
              via ConversationThreadList; non-Discord inboxes have an empty
              threadMap, so everything renders as one flat list. */}
          <ConversationThreadList
            conversations={conversations || []}
            threadMap={threadMap}
            renderItem={renderConversationItem}
          />
          {!loading && conversations?.length > 0 && pageInfo?.hasNextPage && (
            <Button
              variant="ghost"
              ref={ref}
              className="pl-6 h-8 w-full text-muted-foreground"
              asChild
            >
              <div>
                <IconLoader className="size-4 animate-spin" />
                loading more...
              </div>
            </Button>
          )}
        </div>
      </div>
    </ConversationListContext.Provider>
  );
};
