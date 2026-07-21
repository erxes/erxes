import { IConversation } from '@/inbox/types/Conversation';
import { IIntegration } from '@/integrations/types/Integration';
import { IntegrationType } from '@/types/Integration';

/** Per-channel grouping is a Discord-only feature; other inboxes are untouched. */
export const isDiscordConversation = (conversation: IConversation): boolean =>
  conversation.integration?.kind === IntegrationType.DISCORD_MESSENGER;

/**
 * Human label for the channel a conversation belongs to. Each Discord channel
 * is its own integration named like "TEST - #general", so we surface the
 * trailing "#channel" when present and fall back to the integration / inbox
 * channel name for everything else.
 */
export const channelLabelFromIntegration = (
  integration?: IIntegration,
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
