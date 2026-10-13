import type {
  DiscordMention,
  TDiscordMessagePayload,
} from '@/integrations/discord/@types/activity';

import {
  USER_MENTION_RE,
  ROLE_MENTION_RE,
  CHANNEL_MENTION_RE,
  CUSTOM_EMOJI_RE,
  TIMESTAMP_RE,
} from '@/integrations/discord/constants/mentions';

/** Choose the display name for a user mentioned in a Discord payload. */
export const discordMention = (
  user: NonNullable<TDiscordMessagePayload['mentions']>[number],
) => ({
  id: user?.id,
  name: user?.member?.nick || user?.global_name || user?.username || user?.id,
});

/** Replace Discord mention markup with readable inbox text. */
export function resolveDiscordMentions(
  content: string,
  mentions: DiscordMention[] = [],
): string {
  if (!content) {
    return content;
  }

  const nameById = new Map(
    mentions.map((mention) => [mention.id, mention.name]),
  );

  const resolved = content
    .replace(USER_MENTION_RE, (full, id) => {
      const name = nameById.get(id);
      return name ? `@${name}` : '@unknown-user';
    })
    .replace(ROLE_MENTION_RE, '@role')
    .replace(CHANNEL_MENTION_RE, '#channel')
    .replace(CUSTOM_EMOJI_RE, ':$1:')
    .replace(TIMESTAMP_RE, (_full, seconds) =>
      new Date(Number(seconds) * 1000).toLocaleString('en-US'),
    );

  return resolved;
}
