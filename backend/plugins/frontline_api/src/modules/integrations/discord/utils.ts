import { randomUUID } from 'node:crypto';
import { promises as fsPromises } from 'node:fs';
import { tmpdir } from 'node:os';
import { basename, join } from 'node:path';
import {
  APIActionRowComponent,
  APIApplication,
  APIChannel,
  APIComponentInMessageActionRow,
  APIEmbed,
  APIGuild,
  APIMessage,
  APIThreadChannel,
  APIUser,
  ChannelType,
  RESTAPIPoll,
  RESTGetAPICurrentUserGuildsResult,
  ThreadChannelType,
} from 'discord-api-types/v10';
import { getEnv, uploadFileToStorage } from 'erxes-api-shared/utils';
import { DISCORD_API_URL } from '@/integrations/discord/constants';
import { DiscordAttachment } from '@/integrations/discord/@types/activity';
import { debugError } from '@/integrations/discord/debuggers';

export const getErrorMessage = (e: unknown): string =>
  e instanceof Error ? e.message : String(e);

export const resolveAttachmentUrl = (
  subdomain: string,
  urlOrKey: string,
): string => {
  if (urlOrKey.startsWith('http')) {
    return urlOrKey;
  }

  const DOMAIN = getEnv({ name: 'DOMAIN', subdomain });
  const NODE_ENV = getEnv({ name: 'NODE_ENV' });

  return NODE_ENV === 'development'
    ? `${DOMAIN}/pl:core/read-file?key=${urlOrKey}`
    : `${DOMAIN}/gateway/pl:core/read-file?key=${urlOrKey}`;
};

type InboundAttachment = DiscordAttachment;

const MAX_REHOST_IMAGE_BYTES = 25 * 1024 * 1024;

const filenameFromUrl = (url: string, index: number): string => {
  try {
    const { pathname } = new URL(url);
    const last = pathname.split('/').filter(Boolean).pop();
    return last || `attachment-${index}`;
  } catch {
    return `attachment-${index}`;
  }
};

const rehostImage = async (
  subdomain: string,
  attachment: InboundAttachment,
): Promise<InboundAttachment> => {
  if (attachment.size && attachment.size > MAX_REHOST_IMAGE_BYTES) {
    return attachment;
  }

  let tmpPath: string | undefined;
  try {
    const res = await fetch(attachment.url);
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }

    const buffer = Buffer.from(await res.arrayBuffer());
    if (buffer.byteLength > MAX_REHOST_IMAGE_BYTES) {
      return attachment;
    }

    const fileName = basename(
      attachment.name || filenameFromUrl(attachment.url, 0),
    );
    tmpPath = join(tmpdir(), `discord-${randomUUID()}-${fileName}`);
    await fsPromises.writeFile(tmpPath, buffer);

    const key = await uploadFileToStorage({
      subdomain,
      filePath: tmpPath,
      fileName,
      mimetype: attachment.type,
    });

    return { ...attachment, url: key, size: buffer.byteLength };
  } catch (e) {
    debugError(
      `Failed to re-host Discord image ${
        attachment.url
      }, keeping CDN URL: ${getErrorMessage(e)}`,
    );
    return attachment;
  } finally {
    if (tmpPath) {
      await fsPromises.rm(tmpPath, { force: true }).catch(() => undefined);
    }
  }
};

export const rehostImageAttachments = (
  subdomain: string,
  attachments?: InboundAttachment[],
): Promise<InboundAttachment[]> => {
  if (!attachments?.length) {
    return Promise.resolve(attachments || []);
  }

  return Promise.all(
    attachments.map((attachment) =>
      attachment.type?.startsWith('image')
        ? rehostImage(subdomain, attachment)
        : Promise.resolve(attachment),
    ),
  );
};

export const sanitizeToken = (token?: string): string =>
  (token || '').replace(/\s/g, '');

export class DiscordApiError extends Error {
  status: number;
  discordCode?: number;

  constructor(status: number, message: string, discordCode?: number) {
    super(message);
    this.name = 'DiscordApiError';
    this.status = status;
    this.discordCode = discordCode;
  }
}

type TDiscordRequestArgs = {
  token: string;
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  path: string;
  body?: unknown;
  form?: FormData;
};

type TDiscordErrorBody = {
  message?: string;
  code?: number;
  retry_after?: number;
};

const parseDiscordResponse = (text: string): unknown => {
  try {
    return text ? JSON.parse(text) : {};
  } catch {
    return { message: text };
  }
};

const MAX_RATE_LIMIT_RETRIES = 5;

const buildRequestHeaders = (
  token: string,
  form?: FormData,
): Record<string, string> => ({
  Authorization: `Bot ${token}`,
  ...(form ? {} : { 'Content-Type': 'application/json' }),
});

const buildRequestBody = (form: FormData | undefined, body: unknown) => {
  if (form) {
    return form;
  }
  return body === undefined ? undefined : JSON.stringify(body);
};

const resolveRetryAfterMs = (
  response: Response,
  errorBody: TDiscordErrorBody,
) => {
  const capMs = (retryAfterSec: number) =>
    Math.min(Math.max(retryAfterSec * 1000, 0), 60_000);

  const headerRetryHeader = response.headers.get('retry-after');
  const headerRetry =
    headerRetryHeader === null ? NaN : Number(headerRetryHeader);
  if (Number.isFinite(headerRetry)) {
    return capMs(headerRetry);
  }

  const bodyRetry = Number(errorBody?.retry_after);
  if (Number.isFinite(bodyRetry)) {
    return capMs(bodyRetry);
  }

  return capMs(1);
};

const discordRequest = async <T>({
  token,
  method,
  path,
  body,
  form,
}: TDiscordRequestArgs): Promise<T> => {
  for (let attempt = 0; ; attempt++) {
    const response = await fetch(`${DISCORD_API_URL}${path}`, {
      method,
      headers: buildRequestHeaders(token, form),
      body: buildRequestBody(form, body),
    });

    const data = parseDiscordResponse(await response.text());
    const errorBody = data as TDiscordErrorBody;

    if (response.status === 429 && attempt < MAX_RATE_LIMIT_RETRIES) {
      const waitMs = resolveRetryAfterMs(response, errorBody);
      await new Promise((resolve) => setTimeout(resolve, waitMs));
      continue;
    }

    if (!response.ok) {
      throw new DiscordApiError(
        response.status,
        `Discord API error ${response.status}: ${
          errorBody?.message || response.statusText
        }`,
        errorBody?.code,
      );
    }

    return data as T;
  }
};

const MAX_ATTACHMENT_BYTES = 10 * 1024 * 1024;

export type DiscordMessageAttachment = { url: string; filename?: string };

export type DiscordPollRequest = RESTAPIPoll;

type TSendChannelMessageArgs = {
  token: string;
  channelId: string;
  content?: string;
  embeds?: APIEmbed[];
  components?: APIActionRowComponent<APIComponentInMessageActionRow>[];
  files?: DiscordMessageAttachment[];
  poll?: DiscordPollRequest;
};

const typingTimers = new Map<string, ReturnType<typeof setInterval>>();
const TYPING_REFRESH_MS = 8000;
const TYPING_MAX_MS = 15000;
export const AUTOMATION_TYPING_MAX_MS = 60000;

export const sendTypingIndicator = (token: string, channelId: string) =>
  discordRequest<unknown>({
    token,
    method: 'POST',
    path: `/channels/${channelId}/typing`,
  }).catch((e) =>
    debugError(
      `Failed to send Discord typing indicator: ${getErrorMessage(e)}`,
    ),
  );

export const stopTypingIndicator = (channelId: string) => {
  const timer = typingTimers.get(channelId);
  if (timer) {
    clearInterval(timer);
    typingTimers.delete(channelId);
  }
};

export const startTypingIndicator = (
  token: string,
  channelId: string,
  maxMs: number = TYPING_MAX_MS,
) => {
  stopTypingIndicator(channelId);
  sendTypingIndicator(token, channelId).catch(() => undefined);

  const startedAt = Date.now();
  const timer = setInterval(() => {
    if (Date.now() - startedAt >= maxMs) {
      stopTypingIndicator(channelId);
      return;
    }
    sendTypingIndicator(token, channelId).catch(() => undefined);
  }, TYPING_REFRESH_MS);
  timer.unref?.();
  typingTimers.set(channelId, timer);
};

const CHUNK_SIZE = 1900;
const MAX_CHUNKS = 10;

const isHighSurrogate = (code: number) => code >= 0xd800 && code <= 0xdbff;

const pickCut = (window: string, maxLen: number): number | null => {
  for (const sep of ['\n\n', '\n', ' ']) {
    const i = window.lastIndexOf(sep);
    if (i > maxLen * 0.5) return i + sep.length;
  }
  return null;
};

const balanceCodeFences = (chunks: string[]): string[] => {
  let open: string | null = null;
  return chunks.map((chunk) => {
    const prefix = open === null ? '' : `\`\`\`${open}\n`;
    for (const marker of chunk.match(/^[ \t]*```(\w*)/gm) || []) {
      open = open === null ? marker.trim().slice(3) : null;
    }
    const suffix = open === null ? '' : '\n```';
    return prefix + chunk + suffix;
  });
};

export const splitDiscordContent = (
  content: string,
  maxLen: number = CHUNK_SIZE,
): { chunks: string[]; truncated: boolean } => {
  if (!content) return { chunks: [], truncated: false };
  if (content.length <= maxLen) return { chunks: [content], truncated: false };

  const chunks: string[] = [];
  let rest = content;

  while (rest.length > maxLen && chunks.length < MAX_CHUNKS - 1) {
    let cut = pickCut(rest.slice(0, maxLen), maxLen);
    cut ??= isHighSurrogate(rest.charCodeAt(maxLen - 1)) ? maxLen - 1 : maxLen;
    const piece = rest.slice(0, cut).trimEnd();
    if (piece) chunks.push(piece);
    rest = rest.slice(cut);
  }

  let truncated = false;
  if (rest.length > maxLen) {
    truncated = true;
    let tail = rest.slice(0, maxLen - 1);
    if (isHighSurrogate(tail.charCodeAt(tail.length - 1))) {
      tail = tail.slice(0, -1);
    }
    chunks.push(`${tail.trimEnd()}…`);
  } else if (rest.trim()) {
    chunks.push(rest);
  }

  return { chunks: balanceCodeFences(chunks), truncated };
};

const postDiscordMessage = async ({
  token,
  channelId,
  content,
  embeds,
  components,
  files,
  poll,
}: TSendChannelMessageArgs): Promise<APIMessage> => {
  const payload: Record<string, unknown> = {};
  if (content) payload.content = content;
  if (embeds?.length) payload.embeds = embeds;
  if (components?.length) payload.components = components;
  if (poll) payload.poll = poll;

  const path = `/channels/${channelId}/messages`;

  if (!files?.length) {
    return discordRequest<APIMessage>({
      token,
      method: 'POST',
      path,
      body: payload,
    });
  }

  const form = new FormData();

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    if (!file?.url) continue;

    const res = await fetch(file.url);
    if (!res.ok) {
      throw new Error(
        `Failed to fetch attachment ${file.url}: HTTP ${res.status}`,
      );
    }

    const blob = await res.blob();
    if (blob.size > MAX_ATTACHMENT_BYTES) {
      throw new Error(
        `Attachment ${file.url} is ${(blob.size / 1024 / 1024).toFixed(
          1,
        )}MB, over the 10MB Discord limit`,
      );
    }

    form.append(
      `files[${i}]`,
      blob,
      file.filename || filenameFromUrl(file.url, i),
    );
  }

  form.append('payload_json', JSON.stringify(payload));

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
  const { token, channelId, content, embeds, components, files, poll } = args;
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
    });
  }

  const lastText = chunks.pop() as string;
  for (const chunk of chunks) {
    await postDiscordMessage({ token, channelId, content: chunk });
  }
  return postDiscordMessage({
    token,
    channelId,
    content: lastText,
    embeds,
    components,
    files,
    poll,
  });
};

export const openDmChannel = (token: string, userId: string) => {
  return discordRequest<APIChannel>({
    token,
    method: 'POST',
    path: '/users/@me/channels',
    body: { recipient_id: userId },
  });
};

export const getCurrentBotUser = (token: string) => {
  return discordRequest<APIUser>({ token, method: 'GET', path: '/users/@me' });
};

export const getDiscordUser = (token: string, userId: string) => {
  return discordRequest<APIUser>({
    token,
    method: 'GET',
    path: `/users/${userId}`,
  });
};

const GATEWAY_MESSAGE_CONTENT = 1 << 18;
const GATEWAY_MESSAGE_CONTENT_LIMITED = 1 << 19;

export const hasMessageContentIntent = (flags?: number): boolean =>
  typeof flags === 'number' &&
  (flags & (GATEWAY_MESSAGE_CONTENT | GATEWAY_MESSAGE_CONTENT_LIMITED)) !== 0;

export const getApplicationInfo = (token: string) => {
  return discordRequest<APIApplication>({
    token,
    method: 'GET',
    path: '/applications/@me',
  });
};

export const listBotGuilds = (token: string) => {
  return discordRequest<RESTGetAPICurrentUserGuildsResult>({
    token,
    method: 'GET',
    path: '/users/@me/guilds',
  });
};

const ROUTABLE_CHANNEL_TYPES = new Set<ChannelType>([
  ChannelType.GuildText,
  ChannelType.GuildAnnouncement,
]);

export const getChannel = (token: string, channelId: string) => {
  return discordRequest<APIChannel>({
    token,
    method: 'GET',
    path: `/channels/${channelId}`,
  });
};

export const getGuild = (token: string, guildId: string) => {
  return discordRequest<APIGuild>({
    token,
    method: 'GET',
    path: `/guilds/${guildId}`,
  });
};

export const isThreadChannel = (
  channel: APIChannel,
): channel is APIThreadChannel<ThreadChannelType> =>
  channel.type === ChannelType.AnnouncementThread ||
  channel.type === ChannelType.PublicThread ||
  channel.type === ChannelType.PrivateThread;

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

type GuildChannelLike = {
  id: string;
  name?: string;
  type: ChannelType;
  position?: number;
  parent_id?: string | null;
};

export const listGuildChannels = async (token: string, guildId: string) => {
  const channels = await discordRequest<APIChannel[]>({
    token,
    method: 'GET',
    path: `/guilds/${guildId}/channels`,
  });

  const all = (Array.isArray(channels) ? channels : []) as GuildChannelLike[];

  const categories = new Map<string, { name: string; position: number }>();
  for (const c of all) {
    if (c.type === ChannelType.GuildCategory) {
      categories.set(c.id, { name: c.name ?? '', position: c.position ?? 0 });
    }
  }

  return all
    .filter((c) => ROUTABLE_CHANNEL_TYPES.has(c.type))
    .map((c) => {
      const parentId = c.parent_id ?? undefined;
      const category = parentId ? categories.get(parentId) : undefined;
      return {
        id: c.id,
        name: c.name,
        type: c.type,
        position: c.position ?? 0,
        parentId,
        parentName: category?.name,
        parentPosition: category ? category.position : -1,
      };
    })
    .sort(
      (a, b) => a.parentPosition - b.parentPosition || a.position - b.position,
    );
};

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

export const listActiveThreads = async (
  token: string,
  guildId: string,
): Promise<APIThreadChannel<ThreadChannelType>[]> => {
  const res = await discordRequest<{
    threads: APIThreadChannel<ThreadChannelType>[];
  }>({
    token,
    method: 'GET',
    path: `/guilds/${guildId}/threads/active`,
  });

  return Array.isArray(res?.threads) ? res.threads : [];
};
