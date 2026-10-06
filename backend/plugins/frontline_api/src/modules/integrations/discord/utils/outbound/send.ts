import { type APIMessage } from 'discord-api-types/v10';

import { debugError } from '@/integrations/discord/debuggers';

import {
  type TSendChannelMessageArgs,
  type DiscordMessageAttachment,
} from '@/integrations/discord/@types/outgoingMessage';

import {
  fetchWithNetworkRetry,
  getErrorMessage,
  discordRequest,
} from '@/integrations/discord/utils/request';

import { filenameFromUrl } from '@/integrations/discord/utils/media/attachments';

import { splitDiscordContent } from '@/integrations/discord/utils/messages/content';
import {
  MAX_CHUNKS,
  CHUNK_SIZE,
} from '@/integrations/discord/constants/messages';

import { MAX_ATTACHMENT_BYTES } from '@/integrations/discord/constants/attachments';

/** Build a Discord API payload from text, media and references. */
const buildDiscordMessagePayload = ({
  content,
  embeds,
  components,
  poll,
  messageReference,
}: TSendChannelMessageArgs) => {
  const payload: Record<string, unknown> = {};
  if (content) payload.content = content;
  if (embeds?.length) payload.embeds = embeds;
  if (components?.length) payload.components = components;
  if (poll) payload.poll = poll;
  if (messageReference) {
    payload.message_reference =
      typeof messageReference === 'string'
        ? {
            type: 0,
            message_id: messageReference,
            fail_if_not_exists: false,
          }
        : {
            type: messageReference.type,
            message_id: messageReference.messageId,
            channel_id: messageReference.channelId,
            ...(messageReference.guildId && {
              guild_id: messageReference.guildId,
            }),
            fail_if_not_exists: true,
          };
  }
  return payload;
};

/** Attach binary files to a Discord message payload. */
const buildDiscordMessageForm = async (
  files: DiscordMessageAttachment[],
  payload: Record<string, unknown>,
) => {
  const form = new FormData();
  for (const [index, file] of files.entries()) {
    let response: Response;
    try {
      response = await fetchWithNetworkRetry(file.url);
    } catch (error) {
      const attachmentLabel = file.filename || `#${index + 1}`;
      throw new Error(
        `Could not read attachment ${attachmentLabel} from storage: ${getErrorMessage(
          error,
        )}`,
      );
    }
    if (!response.ok) {
      throw new Error(
        `Failed to fetch attachment ${file.url}: HTTP ${response.status}`,
      );
    }
    const blob = await response.blob();
    if (blob.size > MAX_ATTACHMENT_BYTES) {
      throw new Error(
        `Attachment ${file.url} is ${(blob.size / 1024 / 1024).toFixed(
          1,
        )}MB, over the 10MB Discord limit`,
      );
    }
    form.append(
      `files[${index}]`,
      blob,
      file.filename || filenameFromUrl(file.url, index),
    );
  }
  form.append('payload_json', JSON.stringify(payload));
  return form;
};

/** Post one message payload to a Discord channel. */
const postDiscordMessage = async (
  args: TSendChannelMessageArgs,
): Promise<APIMessage> => {
  const { token, channelId, files } = args;
  const payload = buildDiscordMessagePayload(args);

  const path = `/channels/${channelId}/messages`;

  if (!files?.length) {
    return discordRequest<APIMessage>({
      token,
      method: 'POST',
      path,
      body: payload,
    });
  }

  const form = await buildDiscordMessageForm(files, payload);

  return discordRequest<APIMessage>({
    token,
    method: 'POST',
    path,
    form,
  });
};

export const sendChannelMessage = async (
  args: TSendChannelMessageArgs,
): Promise<APIMessage> => {
  const {
    token,
    channelId,
    content,
    embeds,
    components,
    files,
    poll,
    messageReference,
  } = args;
  const { chunks, truncated } = splitDiscordContent(content || '');

  if (truncated) {
    debugError(
      `Discord reply for channel ${channelId} exceeded the ${MAX_CHUNKS}-message ` +
        `cap (${(content || '').length} chars); sent ~${
          MAX_CHUNKS * CHUNK_SIZE
        } ` +
        'and dropped the rest',
    );
  }

  if (chunks.length <= 1) {
    return postDiscordMessage({
      token,
      channelId,
      content: chunks[0] ?? content,
      embeds,
      components,
      files,
      poll,
      messageReference,
    });
  }

  const lastText = chunks.pop() as string;
  for (const chunk of chunks) {
    await postDiscordMessage({
      token,
      channelId,
      content: chunk,
    });
  }
  return postDiscordMessage({
    token,
    channelId,
    content: lastText,
    embeds,
    components,
    files,
    poll,
    messageReference,
  });
};
