import { type APIMessage } from 'discord-api-types/v10';
import { discordRequest } from '@/integrations/discord/utils/request';

export const getMessage = (
  token: string,
  channelId: string,
  messageId: string,
) => {
  return discordRequest<APIMessage>({
    token,
    method: 'GET',
    path: `/channels/${channelId}/messages/${messageId}`,
  });
};

export const editChannelMessage = (
  token: string,
  channelId: string,
  messageId: string,
  content: string,
) =>
  discordRequest<APIMessage>({
    token,
    method: 'PATCH',
    path: `/channels/${channelId}/messages/${messageId}`,
    body: { content },
  });

export const deleteChannelMessage = (
  token: string,
  channelId: string,
  messageId: string,
) =>
  discordRequest<unknown>({
    token,
    method: 'DELETE',
    path: `/channels/${channelId}/messages/${messageId}`,
  });

/** Add the bot reaction to a Discord message. */
export const addChannelMessageReaction = (
  token: string,
  channelId: string,
  messageId: string,
  emoji: string,
) =>
  discordRequest<unknown>({
    token,
    method: 'PUT',
    path: `/channels/${channelId}/messages/${messageId}/reactions/${encodeURIComponent(
      emoji,
    )}/@me`,
  });

/** Remove the bot reaction from a Discord message. */
export const removeChannelMessageReaction = (
  token: string,
  channelId: string,
  messageId: string,
  emoji: string,
) =>
  discordRequest<unknown>({
    token,
    method: 'DELETE',
    path: `/channels/${channelId}/messages/${messageId}/reactions/${encodeURIComponent(
      emoji,
    )}/@me`,
  });

/** Pin a message in its Discord channel. */
export const pinChannelMessage = (
  token: string,
  channelId: string,
  messageId: string,
) =>
  discordRequest<unknown>({
    token,
    method: 'PUT',
    path: `/channels/${channelId}/messages/pins/${messageId}`,
  });

/** Unpin a message in its Discord channel. */
export const unpinChannelMessage = (
  token: string,
  channelId: string,
  messageId: string,
) =>
  discordRequest<unknown>({
    token,
    method: 'DELETE',
    path: `/channels/${channelId}/messages/pins/${messageId}`,
  });

export const listChannelMessages = async (
  token: string,
  channelId: string,
  { limit = 100, before }: { limit?: number; before?: string } = {},
): Promise<APIMessage[]> => {
  const params = new URLSearchParams({
    limit: String(Math.min(Math.max(limit, 1), 100)),
  });
  if (before) {
    params.set('before', before);
  }

  const messages = await discordRequest<APIMessage[]>({
    token,
    method: 'GET',
    path: `/channels/${channelId}/messages?${params.toString()}`,
  });

  return Array.isArray(messages) ? messages : [];
};
