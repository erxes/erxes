import { IconLoader } from '@tabler/icons-react';

import { ConversationContext } from '@/inbox/conversations/context/ConversationContext';
import { ConversationListContext } from '@/inbox/conversations/context/ConversationListContext';
import { IConversation } from '@/inbox/types/Conversation';
import { useConversations } from '@/inbox/conversations/hooks/useConversations';

import { Filter, Separator } from 'erxes-ui';

import { ConversationsHeader } from '@/inbox/conversations/components/ConversationsHeader';
import { ConversationItem } from '@/inbox/conversations/components/ConversationItem';
import { ConversationThreadList } from '@/inbox/conversations/components/ConversationChannelSection';
import { isDiscordConversation } from '@/inbox/conversations/utils/channelGroups';
import { useDiscordConversationChannels } from '@/integrations/discord/hooks/useDiscordSetup';
import { useMemo } from 'react';
import { ConversationActions } from '@/inbox/conversations/components/ConversationActions';

export const Conversations = () => {
  const {
    totalCount,
    conversations,
    loading,
    containerRef,
    fetchingMore,
    handleConversationSelect,
    handleScroll,
  } = useConversations();

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
        onConversationSelect={handleConversationSelect}
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
        <div className="relative min-h-0 flex-1">
          <div
            className="h-full w-full overflow-y-auto pb-10"
            ref={containerRef}
            onScroll={handleScroll}
          >
            <ConversationThreadList
              conversations={conversations || []}
              threadMap={channelMap}
              renderItem={renderConversationItem}
            />
          </div>
          {fetchingMore && (
            <div className="pointer-events-none absolute inset-x-0 bottom-2 flex justify-center">
              <div className="flex size-8 items-center justify-center rounded-full border bg-background/95 text-muted-foreground shadow-sm backdrop-blur-sm">
                <IconLoader className="size-4 animate-spin" />
              </div>
            </div>
          )}
        </div>
      </div>
    </ConversationListContext.Provider>
  );
};
