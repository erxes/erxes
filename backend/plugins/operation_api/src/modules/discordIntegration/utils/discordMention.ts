import {
  IDiscordConfig,
  TDiscordChannelMention,
} from '@/discordIntegration/@types/discordConfig';
import { TDiscordNotificationEvent } from '@/discordIntegration/@types/discordNotification';

const ZERO_WIDTH_SPACE = '​';

export const getChannelMention = (
  { mention, mentionEvents }: Pick<IDiscordConfig, 'mention' | 'mentionEvents'>,
  event: TDiscordNotificationEvent,
): TDiscordChannelMention | undefined => {
  if (!mention || mention === 'none' || !mentionEvents?.includes(event)) {
    return undefined;
  }

  return mention;
};

export const disarmDiscordMentions = (value: string) =>
  value.replaceAll('@', `@${ZERO_WIDTH_SPACE}`);

export const buildAllowedMentions = ({
  channel,
  userId,
}: {
  channel?: TDiscordChannelMention;
  userId?: string;
}) => ({
  parse: channel ? ['everyone'] : [],
  ...(userId ? { users: [userId] } : {}),
});
