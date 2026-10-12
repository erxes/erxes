import {
  IConversation,
  IConversationIntegration,
} from '@/inbox/types/Conversation';
import { IntegrationType } from '@/types/Integration';

export const isDiscordConversation = (conversation: IConversation): boolean =>
  conversation.integration?.kind === IntegrationType.DISCORD_MESSENGER;

export const channelLabelFromIntegration = (
  integration?: Pick<IConversationIntegration, 'name'> &
    Partial<Pick<IConversationIntegration, 'channel'>>,
): string => {
  if (!integration) {
    return 'Other';
  }

  const hashMatch = integration.name?.match(/#\s*([^#]+)$/);
  if (hashMatch) {
    return `#${hashMatch[1].trim()}`;
  }

  return integration.name || integration.channel?.name || 'Other';
};

export const channelGroupFromIntegration = (
  integration?: Pick<IConversationIntegration, 'name'>,
): string => {
  const name = integration?.name?.trim() || '';
  const separatorIndex = name.indexOf(' - #');
  const prefix = separatorIndex === -1 ? name : name.slice(0, separatorIndex);
  return prefix.trim() || 'Other';
};
