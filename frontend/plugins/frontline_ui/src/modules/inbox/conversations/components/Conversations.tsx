import { Empty, Filter, ScrollArea, Separator, Spinner } from 'erxes-ui';

import { ConversationActions } from '@/inbox/conversations/components/ConversationActions';
import { ConversationContext } from '@/inbox/conversations/context/ConversationContext';
import { ConversationItem } from '@/inbox/conversations/components/ConversationItem';
import { ConversationListContext } from '@/inbox/conversations/context/ConversationListContext';
import { ConversationThreadList } from '@/inbox/conversations/components/ConversationChannelSection';
import { ConversationsHeader } from '@/inbox/conversations/components/ConversationsHeader';
import { ConversationsLoading } from '@/inbox/conversations/components/ConversationsLoading';
import { IConversation } from '@/inbox/types/Conversation';
import { IconInbox } from '@tabler/icons-react';
import { compactList } from '@/shared/utils/cursorList';
import { isDiscordConversation } from '@/inbox/conversations/utils/channelGroups';
import { telegramChatLabel } from '@/integrations/telegram/useTelegramChats';
import { toCustomerInline } from '@/inbox/conversations/utils/conversationContext';
import { useConversationListChannels } from '@/inbox/conversations/hooks/useConversationListChannels';
import { useConversations } from '@/inbox/conversations/hooks/useConversations';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

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

  const { channelMap, channelInfoLoading, telegramChats, telegramLoading } =
    useConversationListChannels(conversations);

  const renderConversationItem = (conversation: IConversation) => (
    <ConversationRowProvider key={conversation._id} conversation={conversation}>
      <ConversationItem
        channelInfo={{
          channelName:
            channelMap.get(conversation._id)?.channelName ??
            telegramChatLabel(telegramChats.get(conversation._id)),
        }}
        channelInfoPending={
          (channelInfoLoading &&
            isDiscordConversation(conversation) &&
            !channelMap.has(conversation._id)) ||
          (telegramLoading &&
            conversation.integration?.kind === 'telegram-messenger' &&
            !telegramChats.has(conversation._id))
        }
        onConversationSelect={handleConversationSelect}
      />
    </ConversationRowProvider>
  );

  const renderContent = () => {
    if (loading && !conversations?.length) {
      return <ConversationsLoading />;
    }

    if (!conversations?.length) {
      return (
        <Empty className="min-h-full rounded-none border-0">
          <Empty.Header>
            <Empty.Media variant="icon">
              <IconInbox />
            </Empty.Media>
            <Empty.Title>
              {t('no-conversations-found', 'No conversations found', {
                defaultValue: 'No conversations found',
              })}
            </Empty.Title>
            <Empty.Description>
              {t(
                'no-conversations-description',
                'There are no conversations matching your filters.',
                {
                  defaultValue:
                    'Adjust the active filters or wait for a new conversation.',
                },
              )}
            </Empty.Description>
          </Empty.Header>
        </Empty>
      );
    }

    return (
      <ConversationThreadList
        conversations={conversations}
        threadMap={channelMap}
        renderItem={renderConversationItem}
      />
    );
  };

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
          <ScrollArea.Root className="h-full w-full">
            <ScrollArea.Viewport
              className="pb-10"
              ref={containerRef}
              onScroll={handleScroll}
            >
              {renderContent()}
            </ScrollArea.Viewport>
            <ScrollArea.Bar />
          </ScrollArea.Root>
          {fetchingMore && (
            <div className="pointer-events-none absolute inset-x-0 bottom-2 flex justify-center">
              <div className="flex size-8 items-center justify-center rounded-full border bg-background/95 text-muted-foreground shadow-sm backdrop-blur-sm">
                <Spinner size="default" />
              </div>
            </div>
          )}
        </div>
      </div>
    </ConversationListContext.Provider>
  );
};

const ConversationRowProvider = ({
  conversation,
  children,
}: {
  conversation: IConversation;
  children: ReactNode;
}) => {
  const value = useMemo(
    () => ({
      ...conversation,
      customer: toCustomerInline(conversation.customer),
      integration: conversation.integration ?? undefined,
      tagIds: compactList(conversation.tagIds),
    }),
    [conversation],
  );
  return (
    <ConversationContext.Provider value={value}>
      {children}
    </ConversationContext.Provider>
  );
};
