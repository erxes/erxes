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

/**
 * The group an integration was created under, parsed from the leading part of
 * its name: several channels added together are named "<group> - #channel", so
 * the text before " - #" is the shared group (typically the Discord category
 * the user named the batch after). Falls back to the whole name for a
 * single-channel integration (no shared prefix) so it still has a home.
 */
export const channelGroupFromIntegration = (
  integration?: IIntegration,
): string => {
  const name = integration?.name?.trim() || '';
  const prefixMatch = name.match(/^(.*?)\s*-\s*#/);
  return (prefixMatch ? prefixMatch[1].trim() : name) || 'Other';
};
