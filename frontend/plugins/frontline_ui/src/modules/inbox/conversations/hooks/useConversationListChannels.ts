import type { ConversationListChannels } from '@/inbox/conversations/types/conversationListChannels';
import { isDiscordConversation } from '@/inbox/conversations/utils/channelGroups';
import type { IConversation } from '@/inbox/types/Conversation';
import { useDiscordConversationChannels } from '@/integrations/discord/hooks/useDiscordSetup';
import { useTelegramChats } from '@/integrations/telegram/useTelegramChats';
import { useMemo } from 'react';

export const useConversationListChannels = (
  conversations?: IConversation[],
): ConversationListChannels => {
  const discordConversationIds = useMemo(
    () =>
      (conversations || [])
        .filter(isDiscordConversation)
        .map((conversation) => conversation._id),
    [conversations],
  );
  const { channelMap, loading: channelInfoLoading } =
    useDiscordConversationChannels(discordConversationIds);

  const telegramIds = useMemo(
    () =>
      (conversations || [])
        .filter(
          (conversation) =>
            conversation.integration?.kind === 'telegram-messenger',
        )
        .map((conversation) => conversation._id),
    [conversations],
  );
  const { chats: telegramChats, loading: telegramLoading } =
    useTelegramChats(telegramIds);

  return { channelMap, channelInfoLoading, telegramChats, telegramLoading };
};
