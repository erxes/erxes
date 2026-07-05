import { randomUUID } from 'crypto';
import { promises as fsPromises } from 'fs';
import { tmpdir } from 'os';
import { basename, join } from 'path';
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

/**
 * Narrows an unknown catch value to a printable message, so handlers can log
 * errors without `catch (e: any)` — the shape `useUnknownInCatchVariables`
 * enforces once enabled.
 */
export const getErrorMessage = (e: unknown): string =>
  e instanceof Error ? e.message : String(e);

/**
 * Resolves an inbox attachment's stored value to a URL the backend can fetch.
 * Public cloud storage stores an absolute URL (passed through as-is); local /
 * private storage stores a bare key, which we turn into a `read-file` URL served
 * by core. The backend fetches this itself before re-uploading to Discord, so it
 * only needs to be reachable from this process — localhost is fine in dev, no
 * public tunnel required. Mirrors Facebook's `generateAttachmentUrl`.
 */
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

// ── Inbound image re-hosting ────────────────────────────────────────────────
// Discord attachment CDN URLs are signed and expire ~24h after the message is
// sent, so a stored link goes dead and the inbox history shows a broken image.
// To keep image history durable we re-host inbound *images* into erxes storage
// at receive time and store the returned key (resolved back to a URL by
// `readImage`/`read-file` on render). Videos and other files keep their Discord
// CDN URL: they're larger, not rendered inline, and the expiry tradeoff isn't
// worth the storage cost.
type InboundAttachment = DiscordAttachment;

// Skip re-hosting oversized images and keep the CDN link instead.
const MAX_REHOST_IMAGE_BYTES = 25 * 1024 * 1024;

// Derives a filename from a URL when the config doesn't specify one.
const filenameFromUrl = (url: string, index: number): string => {
  try {
    const { pathname } = new URL(url);
    const last = pathname.split('/').filter(Boolean).pop();
    return last || `attachment-${index}`;
  } catch {
    return `attachment-${index}`;
  }
};

// Re-hosts a single image: fetch the Discord CDN bytes, upload to erxes storage,
// and return the attachment pointing at the storage key. Best-effort — any
// failure (fetch, size cap, upload) degrades to the original CDN URL so a
// re-host hiccup never blocks message ingest.
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

    // `attachment.name` is Discord-supplied; strip any path components so a
    // crafted name (e.g. `../../etc/foo`) can't escape os.tmpdir() when embedded
    // in the temp filename. basename() also keeps the storage upload name clean.
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
      `Failed to re-host Discord image ${attachment.url}, keeping CDN URL: ${getErrorMessage(e)}`,
    );
    return attachment;
  } finally {
    if (tmpPath) {
      await fsPromises.rm(tmpPath, { force: true }).catch(() => undefined);
    }
  }
};

/**
 * Re-hosts inbound image attachments into erxes storage so they survive
 * Discord's ~24h CDN URL expiry; non-image attachments (video/files) pass
 * through unchanged with their original CDN URL. Uploads run in parallel and
 * the function never throws — a failed re-host degrades to the original URL.
 */
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

// Discord tokens/keys are whitespace-free, but pasted values routinely pick up
// stray invisible characters — trailing newlines, zero-width spaces, and U+2028
// line separators — that break the `Authorization` header (a ByteString).
// Strip all whitespace (JS `\s` includes U+2028/U+2029) defensively on save.
export const sanitizeToken = (token?: string): string =>
  (token || '').replace(/\s/g, '');

// ── REST client ─────────────────────────────────────────────────────────────

/**
 * Error thrown for any non-2xx Discord REST response. Carries the HTTP status
 * (and Discord's numeric error code when present) so callers can translate it
 * into an actionable failure message — e.g. 401 -> "invalid token", 403 ->
 * "missing permissions".
 */
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
  // Multipart/form-data body for file uploads. When set it's sent as-is (and
  // `body` is ignored); fetch derives the multipart boundary + Content-Type
  // itself, so we must NOT set Content-Type. Its blob parts are re-readable, so
  // it survives a 429 retry. Routing uploads through here lets them ride out
  // rate limits exactly like the JSON path.
  form?: FormData;
};

// The fields Discord's error / rate-limit responses carry that we act on.
type TDiscordErrorBody = {
  message?: string;
  code?: number;
  retry_after?: number;
};

// Discord normally returns JSON, but error pages (gateways, rate limiters)
// can return HTML/plain text — don't let a parse failure mask the status.
const parseDiscordResponse = (text: string): unknown => {
  try {
    return text ? JSON.parse(text) : {};
  } catch {
    return { message: text };
  }
};

// Bounded retry that honors Discord's 429 `Retry-After`, so bulk operations
// (e.g. history backfill paging through many requests) ride out rate limits
// instead of failing on the first throttle. Only 429s are retried; every other
// error throws immediately, exactly as before.
const MAX_RATE_LIMIT_RETRIES = 5;

// `T` is the wire shape the endpoint returns (from `discord-api-types`); the
// cast at the single return point is the one boundary between Discord's JSON
// and the typed world, so every caller gets a typed result with no `any`.
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
      // Multipart: send FormData as-is and let fetch set the boundary +
      // Content-Type. JSON: set Content-Type and stringify the body.
      headers: form
        ? { Authorization: `Bot ${token}` }
        : {
            Authorization: `Bot ${token}`,
            'Content-Type': 'application/json',
          },
      body: form
        ? form
        : body === undefined
          ? undefined
          : JSON.stringify(body),
    });

    const data = parseDiscordResponse(await response.text());
    const errorBody = data as TDiscordErrorBody;

    // Rate limited: wait the advised interval and retry, up to a bound. The
    // `Retry-After` header and body `retry_after` are both seconds on API v10.
    if (response.status === 429 && attempt < MAX_RATE_LIMIT_RETRIES) {
      const headerRetry = Number(response.headers.get('retry-after'));
      const bodyRetry = Number(errorBody?.retry_after);
      const retryAfterSec = Number.isFinite(headerRetry)
        ? headerRetry
        : Number.isFinite(bodyRetry)
          ? bodyRetry
          : 1;
      // Cap the wait so a pathological value can't hang the caller.
      const waitMs = Math.min(Math.max(retryAfterSec * 1000, 0), 60_000);
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

// Discord's default upload cap for non-boosted servers is 8 MiB. We refuse
// larger files up-front rather than letting Discord reject the whole message.
const MAX_ATTACHMENT_BYTES = 8 * 1024 * 1024;

export type DiscordMessageAttachment = { url: string; filename?: string };

// Discord poll request object (Create Message `poll`): apps CAN create polls
// (they cannot vote on them). `duration` is in hours (1–768).
// https://discord.com/developers/docs/resources/poll#poll-create-request-object
export type DiscordPollRequest = RESTAPIPoll;

type TSendChannelMessageArgs = {
  token: string;
  channelId: string;
  content?: string;
  // Rich embeds: https://discord.com/developers/docs/resources/channel#embed-object
  embeds?: APIEmbed[];
  // Message components (we only build link buttons): https://discord.com/developers/docs/interactions/message-components
  components?: APIActionRowComponent<APIComponentInMessageActionRow>[];
  // Remote files to attach — fetched server-side and uploaded as multipart.
  files?: DiscordMessageAttachment[];
  // Native poll to create alongside the message.
  poll?: DiscordPollRequest;
};

// "<bot> is typing…" indicator. A single ping shows it for ~10s and Discord
// clears it automatically the moment the bot posts a message. To cover a slower
// reply (e.g. an AI Agent action generating text) we keep one refreshing timer
// per channel — capped so it can never linger, and stoppable as soon as the
// reply is sent. https://discord.com/developers/docs/resources/channel#trigger-typing-indicator
const typingTimers = new Map<string, ReturnType<typeof setInterval>>();
const TYPING_REFRESH_MS = 8000;
// Default cap, used for the human-agent typing relay: the inbox composer emits
// fresh typing events as the agent keeps typing, so a short window that gets
// re-armed is enough (and a missed "stop" clears quickly).
const TYPING_MAX_MS = 15000;
// Automation / AI-reply cap. Here the window has to span the WHOLE compose time
// between the trigger matching (when typing starts) and the Send Discord Message
// action firing (when it stops): AI generation alone can take up to
// AI_AGENT_LIMITS.maxTimeoutMs (30s), plus enrollment + action orchestration.
// A 15s cap self-expires mid-generation, so the indicator vanishes before the
// reply lands. Cap it well above the AI ceiling so "…is typing" stays visible
// until the reply is sent, while still bounding it so a trigger that matches but
// never sends a Discord reply can't leave the bot typing forever.
export const AUTOMATION_TYPING_MAX_MS = 60000;

export const sendTypingIndicator = (token: string, channelId: string) =>
  discordRequest<unknown>({
    token,
    method: 'POST',
    path: `/channels/${channelId}/typing`,
  }).catch((e) =>
    debugError(`Failed to send Discord typing indicator: ${getErrorMessage(e)}`),
  );

export const stopTypingIndicator = (channelId: string) => {
  const timer = typingTimers.get(channelId);
  if (timer) {
    clearInterval(timer);
    typingTimers.delete(channelId);
  }
};

// Starts (and keeps alive) the typing indicator for a channel. Idempotent per
// channel; auto-stops after `maxMs` so a never-answered message can't leave the
// bot "typing" forever.
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
  // Don't let the indicator keep the process alive.
  timer.unref?.();
  typingTimers.set(channelId, timer);
};

// --- Long-message chunking -------------------------------------------------
// Discord rejects any message whose content exceeds 2000 characters with a 400,
// and AI Agent replies routinely run longer. Long content is split into ordered
// ≤2000 messages instead of failing. We target 1900 UTF-16 code units per chunk:
// a JS string's `.length` (UTF-16 units) is always ≥ its Discord length (code
// points), so staying ≤1900 keeps us under 2000 even with emoji, and leaves
// headroom for the code-fence markers re-added across a split.
const CHUNK_SIZE = 1900;
// Cap the fan-out so a pathological (or looping) reply can't flood a channel;
// the remainder past the cap is truncated with an ellipsis.
const MAX_CHUNKS = 10;

const isHighSurrogate = (code: number) => code >= 0xd800 && code <= 0xdbff;

// Latest "natural" boundary (paragraph → line → space) in the window that still
// fills at least half the chunk, so we break on structure without tiny chunks.
// Returns the slice index (just past the separator), or null to force a hard cut.
const pickCut = (window: string, maxLen: number): number | null => {
  for (const sep of ['\n\n', '\n', ' ']) {
    const i = window.lastIndexOf(sep);
    if (i > maxLen * 0.5) return i + sep.length;
  }
  return null;
};

// Keeps each chunk independently valid markdown when a ``` code fence straddles
// a split: closes the fence at the end of a chunk and reopens it (same language)
// at the start of the next. Fence state is carried across chunks.
const balanceCodeFences = (chunks: string[]): string[] => {
  let open: string | null = null; // language of the currently-open fence, else null
  return chunks.map((chunk) => {
    const prefix = open !== null ? `\`\`\`${open}\n` : '';
    for (const marker of chunk.match(/^[ \t]*```(\w*)/gm) || []) {
      open = open === null ? marker.trim().slice(3) : null;
    }
    const suffix = open !== null ? '\n```' : '';
    return prefix + chunk + suffix;
  });
};

/**
 * Splits `content` into ordered chunks that each fit Discord's 2000-char limit,
 * preferring natural boundaries so words/markdown aren't cut mid-token, and
 * keeping code fences balanced across splits. Pure + unit-testable. Returns an
 * empty `chunks` for empty content so callers can still send an attachment/poll-
 * only message. At most `MAX_CHUNKS` chunks; `truncated` is true when the
 * remainder past the cap was dropped, so the caller can surface it — the pure
 * split itself has no channel context to log against.
 */
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
    if (cut == null) {
      // No boundary (e.g. a very long URL/token): hard-cut, never mid surrogate.
      cut = isHighSurrogate(rest.charCodeAt(maxLen - 1)) ? maxLen - 1 : maxLen;
    }
    const piece = rest.slice(0, cut).trimEnd();
    if (piece) chunks.push(piece);
    rest = rest.slice(cut);
  }

  let truncated = false;
  if (rest.length > maxLen) {
    // Fan-out cap reached with content left over: truncate the remainder.
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

/**
 * Posts a single message to a Discord channel as the bot (≤2000 chars). Supports
 * plain text, rich embeds, message components (link buttons), file attachments,
 * and polls. When `files` are present the request is multipart/form-data (each
 * URL is fetched server-side and uploaded); otherwise it's a plain JSON POST.
 * https://discord.com/developers/docs/resources/channel#create-message
 */
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

  // Multipart upload: fetch each remote file and attach it. `payload_json`
  // carries the message body alongside the binary parts.
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
        )}MB, over the 8MB Discord limit`,
      );
    }

    form.append(
      `files[${i}]`,
      blob,
      file.filename || filenameFromUrl(file.url, i),
    );
  }

  form.append('payload_json', JSON.stringify(payload));

  // Route the upload through `discordRequest` (as a multipart body) so a
  // throttled attachment reply rides out 429s exactly like the JSON path,
  // instead of failing on the first rate limit.
  return discordRequest<APIMessage>({
    token,
    method: 'POST',
    path,
    form,
  });
};

/**
 * Sends a message to a Discord channel as the bot, transparently splitting
 * content over Discord's 2000-char limit into ordered follow-up messages. Extras
 * (embeds / components / files / poll) ride on the final message, which is
 * returned so callers mirror against the message that echoes them back. Short
 * messages are a single POST, unchanged.
 */
export const sendChannelMessage = async (
  args: TSendChannelMessageArgs,
): Promise<APIMessage> => {
  const { token, channelId, content, embeds, components, files, poll } = args;
  const { chunks, truncated } = splitDiscordContent(content || '');

  // The fan-out cap dropped part of a very long reply. The pure splitter has no
  // channel context to log, so surface it here with the channel + original size
  // so an overrunning automation/AI reply is visible instead of silently
  // trailing an ellipsis.
  if (truncated) {
    debugError(
      `Discord reply for channel ${channelId} exceeded the ${MAX_CHUNKS}-message ` +
        `cap (${(content || '').length} chars); sent ~${MAX_CHUNKS * CHUNK_SIZE} ` +
        'and dropped the rest',
    );
  }

  // Fits in one message (or no text): send content + all extras together,
  // exactly as before — preserves the single-message return shape the mirror
  // relies on.
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

  // Long reply: leading chunks are plain text in order; the last carries the
  // extras. Sent sequentially so Discord keeps them ordered (concurrent sends
  // can arrive shuffled); `discordRequest` rides out any 429 between chunks.
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

/**
 * Opens (or returns the existing) DM channel with a user, so the bot can send a
 * direct message. https://discord.com/developers/docs/resources/user#create-dm
 */
export const openDmChannel = (token: string, userId: string) => {
  return discordRequest<APIChannel>({
    token,
    method: 'POST',
    path: '/users/@me/channels',
    body: { recipient_id: userId },
  });
};

/**
 * Fetches the bot's own user, used to validate the token / connection.
 * https://discord.com/developers/docs/resources/user#get-current-user
 */
export const getCurrentBotUser = (token: string) => {
  return discordRequest<APIUser>({ token, method: 'GET', path: '/users/@me' });
};

/**
 * Fetches a Discord user by id, used to populate the erxes customer profile
 * (username, avatar) when a new sender first appears.
 * https://discord.com/developers/docs/resources/user#get-user
 */
export const getDiscordUser = (token: string, userId: string) => {
  return discordRequest<APIUser>({
    token,
    method: 'GET',
    path: `/users/${userId}`,
  });
};

// ── Setup-wizard helpers ─────────────────────────────────────────────────────
// Read-only proxies that let the connect UI validate a token and pick a
// guild/channel from dropdowns instead of pasting raw snowflake IDs.

// Application `flags` bits that indicate the privileged MESSAGE CONTENT intent
// is enabled (full grant, or the <100-server limited grant). Either means
// inbound message payloads will carry `content`.
// https://discord.com/developers/docs/resources/application#application-object-application-flags
const GATEWAY_MESSAGE_CONTENT = 1 << 18;
const GATEWAY_MESSAGE_CONTENT_LIMITED = 1 << 19;

export const hasMessageContentIntent = (flags?: number): boolean =>
  typeof flags === 'number' &&
  (flags & (GATEWAY_MESSAGE_CONTENT | GATEWAY_MESSAGE_CONTENT_LIMITED)) !== 0;

/**
 * Fetches the bot's application, used to derive the Application (client) id,
 * the interactions Public Key, and whether the MESSAGE CONTENT intent is on —
 * so the user never has to copy those by hand.
 * https://discord.com/developers/docs/resources/application#get-current-application
 */
export const getApplicationInfo = (token: string) => {
  return discordRequest<APIApplication>({
    token,
    method: 'GET',
    path: '/applications/@me',
  });
};

/**
 * Lists the guilds (servers) the bot is a member of, to populate the server
 * picker. https://discord.com/developers/docs/resources/user#get-current-user-guilds
 */
export const listBotGuilds = (token: string) => {
  return discordRequest<RESTGetAPICurrentUserGuildsResult>({
    token,
    method: 'GET',
    path: '/users/@me/guilds',
  });
};

// Discord channel types we can route messages through (text + announcement);
// see https://discord.com/developers/docs/resources/channel#channel-object-channel-types
const ROUTABLE_CHANNEL_TYPES = new Set<ChannelType>([
  ChannelType.GuildText,
  ChannelType.GuildAnnouncement,
]);

/**
 * Fetches a single channel, used to resolve a channel id to its human name
 * (e.g. `#general`) for display in the inbox.
 * https://discord.com/developers/docs/resources/channel#get-channel
 */
export const getChannel = (token: string, channelId: string) => {
  return discordRequest<APIChannel>({
    token,
    method: 'GET',
    path: `/channels/${channelId}`,
  });
};

/**
 * Fetches a guild (server), used to resolve a guild id to its human name for
 * display (e.g. the sidebar's server groups).
 * https://discord.com/developers/docs/resources/guild#get-guild
 */
export const getGuild = (token: string, guildId: string) => {
  return discordRequest<APIGuild>({
    token,
    method: 'GET',
    path: `/guilds/${guildId}`,
  });
};

/**
 * Narrows an `APIChannel` union member to a thread (announcement/public/
 * private), which is what carries `parent_id` — used to nest a thread's inbox
 * conversation under its parent channel.
 */
export const isThreadChannel = (
  channel: APIChannel,
): channel is APIThreadChannel<ThreadChannelType> =>
  channel.type === ChannelType.AnnouncementThread ||
  channel.type === ChannelType.PublicThread ||
  channel.type === ChannelType.PrivateThread;

/**
 * Fetches a single message. Used to re-read a poll's authoritative vote tallies
 * (`poll.results.answer_counts`) after a poll-vote event, since the vote event
 * itself carries only the answer id, not the updated counts.
 * https://discord.com/developers/docs/resources/channel#get-channel-message
 */
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

/**
 * Lists a guild's channels, filtered to the text channels a bot can read/post
 * in, to populate the channel picker.
 * https://discord.com/developers/docs/resources/guild#get-guild-channels
 */
export const listGuildChannels = async (token: string, guildId: string) => {
  const channels = await discordRequest<APIChannel[]>({
    token,
    method: 'GET',
    path: `/guilds/${guildId}/channels`,
  });

  return (Array.isArray(channels) ? channels : []).filter((c) =>
    ROUTABLE_CHANNEL_TYPES.has(c?.type),
  );
};

/**
 * Fetches a page of a channel's (or thread's) messages, newest-first, for
 * history backfill. `before` pages further back. Discord caps `limit` at 100.
 * https://discord.com/developers/docs/resources/channel#get-channel-messages
 */
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

/**
 * Lists a guild's active (non-archived) threads, so backfill can also pull a
 * connected channel's threads. Each carries a `parent_id` to match it to its
 * channel. https://discord.com/developers/docs/resources/guild#list-active-guild-threads
 */
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
