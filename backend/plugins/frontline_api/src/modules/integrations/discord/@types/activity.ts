import {
  APIBaseMessage,
  APIUserWithMember,
  GatewayMessagePollVoteDispatchData,
  Snowflake,
} from 'discord-api-types/v10';

/**
 * Channel-agnostic envelope a raw Discord Gateway `MESSAGE_CREATE` payload is
 * normalized into before storage — the Discord analogue of Facebook's
 * `Activity`. Phase 3's `receiveDiscordMessage` consumes this shape, keeping
 * the transport (Gateway payload quirks) decoupled from the inbox dual-write.
 */
/**
 * The inbound message payloads `mapMessageCreateToActivity` normalizes: a
 * Gateway `MESSAGE_CREATE`/`MESSAGE_UPDATE` dispatch, or a REST `APIMessage`
 * from history backfill. `Partial` because MESSAGE_UPDATE re-deliveries can be
 * sparse in practice — an embed unfurl omits `content` (the edit handler
 * branches on exactly that) and spec-required fields shouldn't be trusted on
 * them — and because REST messages lack the Gateway's extra fields (`guild_id`
 * is injected by the backfill caller). Both wire shapes are assignable to this.
 */
export type TDiscordMessagePayload = Partial<APIBaseMessage> & {
  guild_id?: Snowflake;
  mentions?: APIUserWithMember[];
};

// A user referenced by a `<@ID>` mention in a message, with the display name
// Discord already attaches in the payload — so resolving `<@ID>` -> `@Name`
// needs no extra REST lookup.
export type DiscordMention = {
  id: string;
  name: string;
};

// Normalized Discord poll, flattened from the Gateway's nested `poll` object so
// the inbox can render it without knowing Discord's wire shape. `results` is
// absent until the first vote arrives; poll-vote events then refresh it live,
// but renderers must still tolerate a missing `results` (zero-vote polls).
export type DiscordPoll = {
  question: string;
  answers: { id: number; text: string; emoji?: string }[];
  allowMultiselect: boolean;
  // ISO timestamp when voting closes.
  expiry?: string;
  results?: {
    isFinalized: boolean;
    answerCounts: { id: number; count: number }[];
  };
};

// Normalized Discord message embed (`embeds[]`), flattened from the Gateway's
// nested shape so the inbox can render preview cards without knowing Discord's
// wire format. Covers bot rich embeds / developer cards (present on
// MESSAGE_CREATE) and link/Tenor/Giphy previews (Discord unfurls these
// asynchronously and re-delivers the message via MESSAGE_UPDATE with `embeds[]`
// populated). `type` selects the renderer: `gifv`/`video` play inline,
// `image` shows the image, everything else renders as a rich card.
export type DiscordEmbed = {
  type?: string;
  title?: string;
  description?: string;
  url?: string;
  // Left accent-bar color as `#rrggbb` (Discord sends a 24-bit int).
  color?: string;
  author?: { name?: string; url?: string; iconUrl?: string };
  // The unfurled source, e.g. "Tenor", "YouTube", "GitHub".
  provider?: { name?: string; url?: string };
  thumbnail?: { url?: string; width?: number; height?: number };
  image?: { url?: string; width?: number; height?: number };
  video?: { url?: string; width?: number; height?: number };
  fields?: { name: string; value: string; inline?: boolean }[];
  footer?: { text?: string; iconUrl?: string };
  // ISO timestamp shown in the card footer.
  timestamp?: string;
};

// Mirrors the inbox `IAttachment` shape (with `name`/`size` optional, since
// Discord doesn't always send them) so files render with a name + size and
// image vs file is decided from the MIME `type`.
export type DiscordAttachment = {
  type: string;
  url: string;
  name?: string;
  size?: number;
};

export type DiscordActivity = {
  source: 'discord';
  timestamp: Date;
  // Discord message snowflake — used for message idempotency.
  messageId: string;
  // Discord channel snowflake — the conversation lives here.
  channelId: string;
  // Guild (server) snowflake, absent for DMs.
  guildId?: string;
  author: {
    id: string;
    username: string;
    // True for bot/webhook authors (including our own bot) — used to skip echoes.
    bot: boolean;
  };
  content: string;
  // Discord message type (0 = DEFAULT, 19 = REPLY, 7 = member-join "just
  // landed", 6 = pin, 18 = thread-created, …). Used at ingest to drop system
  // messages that carry no user content.
  type?: number;
  // Users mentioned in `content`, used to render `<@ID>` as a readable `@Name`.
  mentions: DiscordMention[];
  // Present when the message is a Discord poll; rendered as a poll card.
  poll?: DiscordPoll;
  // Link/Tenor/Giphy previews + bot rich embeds; rendered as preview cards.
  // Empty on the first MESSAGE_CREATE for link previews — Discord unfurls them a
  // moment later and re-delivers the message via MESSAGE_UPDATE.
  embeds?: DiscordEmbed[];
  // `name`/`size` come straight from Discord's attachment object
  // (`filename`/`size`).
  attachments: DiscordAttachment[];
  // Original payload, kept for debugging / fields we don't map yet.
  raw: TDiscordMessagePayload;
};

/**
 * Normalized `MESSAGE_POLL_VOTE_ADD` / `MESSAGE_POLL_VOTE_REMOVE` Gateway
 * payload. Discord sends only the voter, the message, and the answer id — not
 * the updated tallies — so the handler re-fetches the message to read the
 * authoritative `poll.results`. `added` distinguishes a cast from a retracted
 * vote (both refresh from the same source, so it's informational).
 */
export type DiscordPollVoteEvent = {
  source: 'discord';
  messageId: string;
  channelId: string;
  guildId?: string;
  // The user who cast/removed the vote.
  userId: string;
  // The poll answer the vote was cast on / removed from.
  answerId: number;
  // True for MESSAGE_POLL_VOTE_ADD, false for MESSAGE_POLL_VOTE_REMOVE.
  added: boolean;
  raw: GatewayMessagePollVoteDispatchData;
};
