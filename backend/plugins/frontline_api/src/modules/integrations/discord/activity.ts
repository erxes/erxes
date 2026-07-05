import {
  APIEmbed,
  APIEmbedImage,
  APIEmbedThumbnail,
  APIEmbedVideo,
  APIPoll,
  GatewayMessagePollVoteDispatchData,
} from 'discord-api-types/v10';
import {
  DiscordActivity,
  DiscordEmbed,
  DiscordMention,
  DiscordPoll,
  DiscordPollVoteEvent,
  TDiscordMessagePayload,
} from '@/integrations/discord/@types/activity';

// Flattens the Gateway's nested `poll` object into our `DiscordPoll`. Discord
// nests an answer's label/emoji under `poll_media`, and vote tallies under
// `results.answer_counts` (absent until the first vote). Returns `undefined`
// for non-poll messages so callers can branch on its presence. Exported so the
// outbound reply path can normalize the poll Discord echoes back on creation.
export const normalizeDiscordPoll = (poll?: APIPoll): DiscordPoll | undefined => {
  if (!poll) {
    return undefined;
  }

  return {
    question: poll.question?.text || '',
    answers: (poll.answers || []).map((answer) => ({
      id: answer.answer_id,
      text: answer.poll_media?.text || '',
      emoji: answer.poll_media?.emoji?.name || undefined,
    })),
    allowMultiselect: Boolean(poll.allow_multiselect),
    expiry: poll.expiry || undefined,
    results: poll.results
      ? {
          isFinalized: Boolean(poll.results.is_finalized),
          answerCounts: (poll.results.answer_counts || []).map((c) => ({
            id: c.id,
            count: c.count || 0,
          })),
        }
      : undefined,
  };
};

type TEmbedMedia = APIEmbedImage | APIEmbedThumbnail | APIEmbedVideo;

// Discord sends an embed image/thumbnail/video both as the origin `url` and a
// CDN-cached `proxy_url`; prefer the proxy (avoids hotlink/referrer breakage and
// mixed-content issues) but fall back to the origin.
const embedMediaUrl = (media?: TEmbedMedia) =>
  media ? media.proxy_url || media.url || undefined : undefined;

const normalizeEmbedMedia = (media?: TEmbedMedia) =>
  media
    ? {
        url: embedMediaUrl(media),
        width: typeof media.width === 'number' ? media.width : undefined,
        height: typeof media.height === 'number' ? media.height : undefined,
      }
    : undefined;

// Flattens the Gateway's nested `embeds[]` into our `DiscordEmbed[]`. Discord's
// color is a 24-bit int; we render it as `#rrggbb`. Returns `undefined` when a
// message has no embeds so callers can branch on its presence.
export const normalizeDiscordEmbeds = (
  embeds?: APIEmbed[],
): DiscordEmbed[] | undefined => {
  if (!Array.isArray(embeds) || embeds.length === 0) {
    return undefined;
  }

  return embeds.map((embed) => ({
    type: embed?.type || undefined,
    title: embed?.title || undefined,
    description: embed?.description || undefined,
    url: embed?.url || undefined,
    color:
      typeof embed?.color === 'number'
        ? `#${embed.color.toString(16).padStart(6, '0')}`
        : undefined,
    author: embed?.author
      ? {
          name: embed.author.name || undefined,
          url: embed.author.url || undefined,
          iconUrl: embed.author.proxy_icon_url || embed.author.icon_url || undefined,
        }
      : undefined,
    provider: embed?.provider
      ? { name: embed.provider.name || undefined, url: embed.provider.url || undefined }
      : undefined,
    thumbnail: normalizeEmbedMedia(embed?.thumbnail),
    image: normalizeEmbedMedia(embed?.image),
    video: normalizeEmbedMedia(embed?.video),
    fields: Array.isArray(embed?.fields)
      ? embed.fields.map((field) => ({
          name: field?.name || '',
          value: field?.value || '',
          inline: Boolean(field?.inline),
        }))
      : undefined,
    footer: embed?.footer
      ? {
          text: embed.footer.text || undefined,
          iconUrl: embed.footer.proxy_icon_url || embed.footer.icon_url || undefined,
        }
      : undefined,
    timestamp: embed?.timestamp || undefined,
  }));
};

/**
 * Normalizes a raw Gateway `MESSAGE_CREATE` payload into a `DiscordActivity`.
 * Pure + transport-agnostic so it is trivially unit-testable without a live
 * Gateway connection.
 */
export const mapMessageCreateToActivity = (
  payload: TDiscordMessagePayload,
): DiscordActivity => {
  const author = payload?.author;

  return {
    source: 'discord',
    timestamp: payload?.timestamp ? new Date(payload.timestamp) : new Date(),
    messageId: payload?.id ?? '',
    channelId: payload?.channel_id ?? '',
    guildId: payload?.guild_id,
    author: {
      id: author?.id ?? '',
      username: author?.username || author?.global_name || author?.id || '',
      // Discord marks bot users with `bot: true`; webhook messages carry a
      // `webhook_id`. Either means "not a human sender".
      bot: Boolean(author?.bot) || Boolean(payload?.webhook_id),
    },
    content: payload?.content || '',
    // Discord message type; see DiscordActivity.type. Kept so system messages
    // (member-join, pins, thread-created, …) can be filtered at ingest.
    type: typeof payload?.type === 'number' ? payload.type : undefined,
    poll: normalizeDiscordPoll(payload?.poll),
    embeds: normalizeDiscordEmbeds(payload?.embeds),
    // Discord attaches the mentioned users (with their display names) on every
    // message, so we capture them here to resolve `<@ID>` tokens without an
    // extra REST call. Prefer the guild nickname, then global name, then handle.
    mentions: (payload?.mentions || []).map((user) => ({
      id: user?.id,
      name:
        user?.member?.nick ||
        user?.global_name ||
        user?.username ||
        user?.id,
    })),
    // Keep the real MIME `content_type` as `type` (consistent with the inbox
    // composer): the frontend decides image-vs-file via `type.startsWith('image')`
    // and can pick per-type icons. Carry `filename`/`size` so files render as a
    // proper download card (name + human-readable size).
    attachments: (payload?.attachments || []).map((att) => ({
      type: att?.content_type || 'application/octet-stream',
      url: att?.url || '',
      name: att?.filename || '',
      size: typeof att?.size === 'number' ? att.size : undefined,
    })),
    raw: payload,
  };
};

// Discord encodes a user mention as `<@ID>` (or `<@!ID>` for the nickname form).
// Inbound content carries these raw ids; this rewrites them to a readable
// `@Name` for display in the inbox, using the names from the message payload's
// `mentions` array. Ids we don't have a name for are left untouched.
const USER_MENTION_RE = /<@!?(\d+)>/g;

export const resolveDiscordMentions = (
  content: string,
  mentions: DiscordMention[] = [],
): string => {
  if (!content) {
    return content;
  }

  const nameById = new Map(mentions.map((mention) => [mention.id, mention.name]));

  return content.replace(USER_MENTION_RE, (full, id) => {
    const name = nameById.get(id);
    return name ? `@${name}` : full;
  });
};

// Discord message types that carry real user content and belong in the inbox:
// DEFAULT (0) and REPLY (19). Everything else is a system message with no user
// text — member-join "just landed" (7), pins (6), boosts (8–11), channel/thread
// notices (4,5,18), etc. Allow-listing (rather than deny-listing) also
// future-proofs against new system types Discord adds later. Slash/context
// command outputs are authored by the app, so they're already caught by the
// bot filter below.
const CONTENT_MESSAGE_TYPES = new Set([0, 19]);

/**
 * Whether an inbound message should be ignored: our own bot's messages, other
 * bots, or webhooks (the Discord equivalent of Facebook's `is_echo` filter), or
 * a system message (member-join, pins, thread-created, …) that has no user
 * content — those would otherwise render as an empty bubble in the inbox.
 */
export const isIgnorableActivity = (activity: DiscordActivity): boolean => {
  return (
    activity.author.bot ||
    !activity.messageId ||
    !activity.channelId ||
    (typeof activity.type === 'number' &&
      !CONTENT_MESSAGE_TYPES.has(activity.type))
  );
};

/**
 * Normalizes a raw `MESSAGE_POLL_VOTE_ADD` / `MESSAGE_POLL_VOTE_REMOVE` payload
 * into a `DiscordPollVoteEvent`. `added` is set by the caller per dispatch type.
 */
export const mapPollVoteToEvent = (
  payload: GatewayMessagePollVoteDispatchData,
  added: boolean,
): DiscordPollVoteEvent => ({
  source: 'discord',
  messageId: payload?.message_id,
  channelId: payload?.channel_id,
  guildId: payload?.guild_id,
  userId: payload?.user_id,
  answerId: payload?.answer_id,
  added,
  raw: payload,
});
