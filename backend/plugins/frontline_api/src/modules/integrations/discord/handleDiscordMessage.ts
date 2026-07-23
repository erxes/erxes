import { APIMessage } from 'discord-api-types/v10';
import { stripHtml } from 'string-strip-html';
import { IModels } from '~/connectionResolvers';
import {
  DiscordMessageAttachment,
  DiscordPollRequest,
  getErrorMessage,
  resolveAttachmentUrl,
  sendChannelMessage,
  startTypingIndicator,
  stopTypingIndicator,
} from '@/integrations/discord/utils';
import {
  normalizeDiscordEmbeds,
  normalizeDiscordPoll,
} from '@/integrations/discord/activity';
import { debugError } from '@/integrations/discord/debuggers';

// The composer's poll form shape (question + options + duration in hours).
type TComposerPoll = {
  question?: string;
  options?: unknown[];
  duration?: number | string;
  allowMultiselect?: boolean;
};

// An inbox attachment as the composer sends it (uploaded to erxes storage).
type TInboxAttachment = { url?: string; name?: string; type?: string };

// The payload the inbox relays for agent-side actions (typing + replies).
type TInboxRelayDoc = {
  integrationId?: string;
  conversationId?: string;
  content?: string;
  userId?: string;
  attachments?: TInboxAttachment[];
  poll?: TComposerPoll;
  typing?: boolean;
};

// Maps the composer's poll input into Discord's Create-Message poll object,
// enforcing Discord's limits (≤300-char question, 1–10 answers ≤55 chars each,
// 1–768h duration). Returns `undefined` when no poll, throws when malformed.
const buildPollRequest = (
  poll?: TComposerPoll,
): DiscordPollRequest | undefined => {
  if (!poll) {
    return undefined;
  }

  const question = (typeof poll.question === 'string' ? poll.question : '')
    .trim()
    .slice(0, 300);
  const answers = (Array.isArray(poll.options) ? poll.options : [])
    .map((text) => (typeof text === 'string' ? text : '').trim())
    .filter(Boolean)
    .slice(0, 10)
    .map((text) => ({ poll_media: { text: text.slice(0, 55) } }));

  if (!question || answers.length < 2) {
    throw new Error('A poll needs a question and at least 2 options');
  }

  return {
    question: { text: question },
    answers,
    duration: Math.min(Math.max(Number(poll.duration) || 24, 1), 768),
    allow_multiselect: Boolean(poll.allowMultiselect),
  };
};

/**
 * Best-effort presence: mirrors the agent's "is typing…" from the inbox
 * composer into the Discord channel while they compose (and clears it when
 * they stop / blur). Reuses the same indicator the automation path uses, so
 * it looks identical, and the util is idempotent + self-caps. Never throws —
 * typing is presence, not delivery.
 */
const handleDiscordTypingRelay = async (
  models: IModels,
  doc: TInboxRelayDoc,
) => {
  try {
    const { integrationId, conversationId, typing = true } = doc;

    const conversation = await models.DiscordConversations.findOne({
      erxesApiId: conversationId,
    });
    if (!conversation?.channelId) {
      return { status: 'success' };
    }

    if (!typing) {
      stopTypingIndicator(conversation.channelId);
      return { status: 'success' };
    }

    const bot = await models.DiscordBots.findOne({
      erxesApiId: integrationId,
    }).sort({ createdAt: -1 });
    if (bot?.token) {
      startTypingIndicator(bot.token, conversation.channelId);
    }
  } catch (e) {
    debugError(`Failed to relay Discord agent typing: ${getErrorMessage(e)}`);
  }

  return { status: 'success' };
};

// The composer encodes a Discord mention as a plain-text token
// `{@discord:USER_ID}` (angle brackets don't survive HTML stripping).
const MENTION_TOKEN = /\{@discord:([^}]+)\}/g;

/**
 * Turns the composer's mention tokens into Discord's `<@USER_ID>` ping for
 * the outgoing message, and into a readable `@Name` for the inbox mirror
 * (both the plain-text mirror and the original HTML `content` the message
 * bubble renders — preserving any rich formatting there instead of showing
 * the raw `{@discord:ID}` token the composer sent).
 */
const resolveMentionsForReply = async (
  models: IModels,
  text: string,
  content: string,
) => {
  const mentionIds = [
    ...new Set([...text.matchAll(MENTION_TOKEN)].map((m) => m[1])),
  ];

  const nameByUserId = new Map<string, string>();
  for (const id of mentionIds) {
    const mentioned = await models.DiscordCustomers.findOne({ userId: id });
    nameByUserId.set(id, mentioned?.firstName || 'user');
  }

  /** Replace a matched mention token with its resolved `@Name`. */
  const toName = (_m: string, id: string) => `@${nameByUserId.get(id) || 'user'}`;

  return {
    discordText: text.replace(MENTION_TOKEN, (_m, id) => `<@${id}>`),
    mirrorText: text.replace(MENTION_TOKEN, toName),
    displayContent: content.replace(MENTION_TOKEN, toName),
  };
};

/**
 * Sends an agent's inbox reply to its Discord channel via REST and mirrors it
 * into the local message store.
 */
const handleDiscordReplyMessenger = async (
  models: IModels,
  subdomain: string,
  doc: TInboxRelayDoc,
) => {
  const {
    integrationId,
    conversationId,
    content = '',
    userId,
    attachments = [],
    poll,
  } = doc;

  const pollRequest = buildPollRequest(poll);

  // The bot that backs this inbox integration carries the token + channel.
  const bot = await models.DiscordBots.findOne({
    erxesApiId: integrationId,
  });

  if (!bot) {
    throw new Error('Discord bot not found for this integration');
  }

  const conversation = await models.DiscordConversations.findOne({
    erxesApiId: conversationId,
  });

  if (!conversation) {
    throw new Error('Discord conversation not found');
  }

  // Discord channels take plain text / markdown, not the inbox's HTML.
  const text = stripHtml(content).result.trim();

  // Inbox attachments are already uploaded to erxes storage; forward their
  // URLs to Discord, which fetches + re-uploads them as multipart parts.
  // The stored `url` is a bare storage key for non-public storage (local /
  // private cloud), so resolve it to a fetchable `read-file` URL first;
  // absolute URLs (public cloud) pass through unchanged.
  const files: DiscordMessageAttachment[] = (
    Array.isArray(attachments) ? attachments : []
  )
    .filter((a): a is TInboxAttachment & { url: string } => Boolean(a?.url))
    .map((a) => ({
      url: resolveAttachmentUrl(subdomain, a.url),
      filename: a.name,
    }));

  if (!text && files.length === 0 && !pollRequest) {
    // Nothing to send (empty reply with no attachments or poll).
    return { status: 'success' };
  }

  const { discordText, mirrorText, displayContent } =
    await resolveMentionsForReply(models, text, content);

  let sent: APIMessage;
  try {
    sent = await sendChannelMessage({
      token: bot.token,
      channelId: conversation.channelId,
      content: discordText,
      files: files.length ? files : undefined,
      poll: pollRequest,
    });
  } catch (e) {
    debugError(`Failed to send Discord reply: ${getErrorMessage(e)}`);
    throw new Error(getErrorMessage(e));
  }

  // The reply is out; stop our local typing-refresh loop (Discord also clears
  // the indicator when the message posts). Mirrors the automation send path.
  stopTypingIndicator(conversation.channelId);

  // Discord echoes the created poll back (now with answer ids + computed
  // expiry); normalize it so the inbox stores + renders the same shape as an
  // inbound poll. Any embeds present on the create response (e.g. a bot-style
  // rich embed) are captured too — link previews unfurl asynchronously and
  // arrive later via MESSAGE_UPDATE, refreshed by the edit handler. The Discord
  // message id is stamped alongside so those later poll-vote / embed events can
  // find this inbox message and refresh it.
  const createdPoll = normalizeDiscordPoll(sent?.poll);
  const createdEmbeds = normalizeDiscordEmbeds(sent?.embeds);
  const extraData =
    createdPoll || createdEmbeds?.length
      ? {
          ...(createdPoll && { poll: createdPoll }),
          ...(createdEmbeds?.length && { embeds: createdEmbeds }),
          discordMessageId: sent?.id,
        }
      : undefined;

  // Mirror the agent's reply locally. Keyed by the Discord message id so the
  // gateway echo of our own message is deduped rather than re-ingested.
  const localMessage = await models.DiscordConversationMessages.create({
    conversationId: conversation._id,
    messageId: sent?.id,
    createdAt: new Date(),
    content: mirrorText,
    attachments,
    userId,
  });

  // A poll-only reply has no text, so use the poll question for the
  // conversation-list preview (kept off the message body, which renders the
  // poll card instead of a duplicate question line).
  const previewContent = mirrorText || createdPoll?.question || '';

  return {
    status: 'success',
    // `content` updates the conversation list preview; `displayContent` is the
    // HTML the inbox persists/renders for the bubble; `extraData` carries the
    // poll the inbox stores + renders as a poll card.
    data: {
      ...localMessage.toObject(),
      conversationId,
      content: previewContent,
      displayContent,
      extraData,
    },
  };
};

/**
 * Handles requests coming FROM the inbox (agent replies). The Discord analogue
 * of Facebook's `handleFacebookMessage`. Currently supports `reply-messenger`:
 * an agent reply in the inbox is sent to the Discord channel via REST and
 * mirrored into the local message store.
 */
export const handleDiscordMessage = async (
  models: IModels,
  msg: { action: string; payload: string },
  subdomain: string,
) => {
  const { action, payload } = msg;
  const doc: TInboxRelayDoc = JSON.parse(payload || '{}');

  if (action === 'typing') {
    return handleDiscordTypingRelay(models, doc);
  }

  if (action === 'reply-messenger') {
    return handleDiscordReplyMessenger(models, subdomain, doc);
  }

  return { status: 'success' };
};
