import type { useDiscordConversationChannels } from '@/integrations/discord/hooks/useDiscordSetup';
import type { useTelegramChats } from '@/integrations/telegram/useTelegramChats';

export interface ConversationListChannels {
  channelMap: ReturnType<typeof useDiscordConversationChannels>['channelMap'];
  channelInfoLoading: boolean;
  telegramChats: ReturnType<typeof useTelegramChats>['chats'];
  telegramLoading: boolean;
}
