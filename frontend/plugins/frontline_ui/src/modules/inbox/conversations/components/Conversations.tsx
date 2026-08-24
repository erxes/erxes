import { IconInbox, IconLoader } from '@tabler/icons-react';

import { ConversationContext } from '@/inbox/conversations/context/ConversationContext';
import { ConversationListContext } from '@/inbox/conversations/context/ConversationListContext';
import { IConversation } from '@/inbox/types/Conversation';
import { useConversations } from '@/inbox/conversations/hooks/useConversations';

import { Empty, Filter, Separator, Skeleton } from 'erxes-ui';

import { ConversationsHeader } from '@/inbox/conversations/components/ConversationsHeader';
import { ConversationItem } from '@/inbox/conversations/components/ConversationItem';
import { ConversationThreadList } from '@/inbox/conversations/components/ConversationChannelSection';
import { isDiscordConversation } from '@/inbox/conversations/utils/channelGroups';
import { useDiscordConversationChannels } from '@/integrations/discord/hooks/useDiscordSetup';
import { useMemo } from 'react';
import { ConversationActions } from '@/inbox/conversations/components/ConversationActions';
import { useTranslation } from 'react-i18next';

const ConversationsLoading = () => (
  <div className="divide-y" aria-label="Loading conversations">
    {Array.from({ length: 8 }).map((_, index) => (
      <div key={index} className="flex items-start gap-3 px-4 py-3">
        <Skeleton className="size-9 shrink-0 rounded-full" />
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex items-center justify-between gap-3">
            <Skeleton className="h-3.5 w-28" />
            <Skeleton className="h-3 w-10" />
          </div>
          <Skeleton className="h-3 w-4/5" />
        </div>
      </div>
    ))}
  </div>
);

export const Conversations = () => {
  const { t } = useTranslation('frontline');
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
            {loading && !conversations?.length ? (
              <ConversationsLoading />
            ) : !conversations?.length ? (
              <Empty className="min-h-full rounded-none border-0">
                <Empty.Header>
                  <Empty.Media variant="icon">
                    <IconInbox />
                  </Empty.Media>
                  <Empty.Title>
                    {t('no-conversations-found', {
                      defaultValue: 'No conversations found',
                    })}
                  </Empty.Title>
                  <Empty.Description>
                    {t('no-conversations-description', {
                      defaultValue:
                        'Adjust the active filters or wait for a new conversation.',
                    })}
                  </Empty.Description>
                </Empty.Header>
              </Empty>
            ) : (
              <ConversationThreadList
                conversations={conversations}
                threadMap={channelMap}
                renderItem={renderConversationItem}
              />
            )}
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
