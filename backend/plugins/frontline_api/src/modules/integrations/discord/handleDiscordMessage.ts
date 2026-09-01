import { APIMessage } from 'discord-api-types/v10';
import { stripHtml } from 'string-strip-html';
import { IModels } from '~/connectionResolvers';
import {
  DiscordMessageAttachment,
  DiscordApiError,
  DiscordPollRequest,
  getDiscordUser,
  getErrorMessage,
  resolveAttachmentUrl,
  sendChannelMessage,
  startTypingIndicator,
  stopTypingIndicator,
  addChannelMessageReaction,
  removeChannelMessageReaction,
  pinChannelMessage,
  unpinChannelMessage,
} from '@/integrations/discord/utils';
import { graphqlPubsub } from 'erxes-api-shared/utils';
import {
  normalizeDiscordEmbeds,
  normalizeDiscordPoll,
} from '@/integrations/discord/activity';
import { debugError } from '@/integrations/discord/debuggers';

type TComposerPoll = {
  question?: string;
  options?: unknown[];
  duration?: number | string;
  allowMultiselect?: boolean;
};

type TInboxAttachment = { url?: string; name?: string; type?: string };

type TInboxRelayDoc = {
  integrationId?: string;
  conversationId?: string;
  content?: string;
  userId?: string;
  attachments?: TInboxAttachment[];
  poll?: TComposerPoll;
  typing?: boolean;
  replyToMessageId?: string;
  messageId?: string;
  reaction?: string;
  remove?: boolean;
};

const DISCORD_REACTION_EMOJI: Record<string, string> = {
  love: '❤️',
  like: '👍',
  wow: '😮',
  haha: '😂',
  sad: '😢',
  angry: '😠',
};

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

const MENTION_TOKEN = /\{@discord:([^}]+)\}/g;

const resolveMentionsForReply = async (
  models: IModels,
  token: string,
  text: string,
  content: string,
) => {
  const mentionIds = [
    ...new Set([...text.matchAll(MENTION_TOKEN)].map((m) => m[1])),
  ];

  const nameByUserId = new Map<string, string>();
  for (const id of mentionIds) {
    const mentioned = await models.DiscordCustomers.findOne({ userId: id });
    let name = mentioned?.firstName;

    if (!name) {
      try {
        const user = await getDiscordUser(token, id);
        name = user?.global_name || user?.username;
      } catch (e) {
        debugError(
          `Failed to resolve Discord mention name for ${id}: ${getErrorMessage(
            e,
          )}`,
        );
      }
    }

    nameByUserId.set(id, name || 'user');
  }

  const toName = (_m: string, id: string) =>
    `@${nameByUserId.get(id) || 'user'}`;

  return {
    discordText: text.replace(MENTION_TOKEN, (_m, id) => `<@${id}>`),
    mirrorText: text.replace(MENTION_TOKEN, toName),
    displayContent: content.replace(MENTION_TOKEN, toName),
  };
};

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
    replyToMessageId,
  } = doc;

  const pollRequest = buildPollRequest(poll);

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

  const text = stripHtml(content).result.trim();

  const files: DiscordMessageAttachment[] = (
    Array.isArray(attachments) ? attachments : []
  )
    .filter((a): a is TInboxAttachment & { url: string } => Boolean(a?.url))
    .map((a) => ({
      url: resolveAttachmentUrl(subdomain, a.url),
      filename: a.name,
    }));

  if (!text && files.length === 0 && !pollRequest) {
    return { status: 'success' };
  }

  const { discordText, mirrorText, displayContent } =
    await resolveMentionsForReply(models, bot.token, text, content);

  const repliedMessage = replyToMessageId
    ? await models.DiscordConversationMessages.findOne({
        conversationId: conversation._id,
        messageId: replyToMessageId,
      })
    : null;
  const replyTo = replyToMessageId
    ? {
        messageId: replyToMessageId,
        content:
          repliedMessage?.content ||
          repliedMessage?.attachments?.[0]?.name ||
          'Original message unavailable',
      }
    : undefined;

  let sent: APIMessage;
  try {
    sent = await sendChannelMessage({
      token: bot.token,
      channelId: conversation.channelId,
      content: discordText,
      files: files.length ? files : undefined,
      poll: pollRequest,
      messageReference: replyToMessageId,
    });
  } catch (e) {
    debugError(`Failed to send Discord reply: ${getErrorMessage(e)}`);
    throw new Error(getErrorMessage(e));
  }

  stopTypingIndicator(conversation.channelId);

  const createdPoll = normalizeDiscordPoll(sent?.poll);
  const createdEmbeds = normalizeDiscordEmbeds(sent?.embeds);
  const extraData = {
    ...(createdPoll && { poll: createdPoll }),
    ...(createdEmbeds?.length && { embeds: createdEmbeds }),
    discordMessageId: sent?.id,
  };

  const localMessage = await models.DiscordConversationMessages.create({
    conversationId: conversation._id,
    messageId: sent?.id,
    createdAt: new Date(),
    content: mirrorText,
    attachments,
    replyTo,
    userId,
  });

  const previewContent = mirrorText || createdPoll?.question || '';

  return {
    status: 'success',
    data: {
      ...localMessage.toObject(),
      conversationId,
      content: previewContent,
      displayContent,
      extraData,
      providerData: { messageId: sent?.id },
      replyTo,
      deliveryStatus: 'sent',
    },
  };
};

const handleDiscordReactMessenger = async (
  models: IModels,
  doc: TInboxRelayDoc,
) => {
  const { integrationId, conversationId, messageId, reaction, remove, userId } =
    doc;
  if (!messageId || !reaction) {
    throw new Error('Message id and reaction are required');
  }
  const conversation = await models.DiscordConversations.findOne({
    erxesApiId: conversationId,
  });
  const bot = await models.DiscordBots.findOne({
    erxesApiId: integrationId,
  }).sort({ createdAt: -1 });
  if (!conversation?.channelId || !bot?.token) {
    throw new Error('Discord conversation is unavailable');
  }
  const emoji = DISCORD_REACTION_EMOJI[reaction] || reaction;
  const updateReaction = remove
    ? removeChannelMessageReaction
    : addChannelMessageReaction;
  await updateReaction(bot.token, conversation.channelId, messageId, emoji);

  const inboxMessage = await models.ConversationMessages.findOne({
    conversationId,
    'extraData.discordMessageId': messageId,
  });
  if (inboxMessage) {
    const extraData = inboxMessage.extraData || {};
    const reactions = Array.isArray(extraData.reactions)
      ? extraData.reactions.filter(
          (item) =>
            typeof item === 'object' &&
            item !== null &&
            item.senderId !== userId &&
            !(item.senderId === bot.applicationId && item.emoji === emoji),
        )
      : [];
    if (!remove) {
      reactions.push({ senderId: userId || 'agent', reaction, emoji });
    }
    inboxMessage.extraData = { ...extraData, reactions };
    inboxMessage.reactions = reactions;
    await inboxMessage.save();
    await graphqlPubsub.publish(
      `conversationMessageInserted:${conversationId}`,
      { conversationMessageInserted: inboxMessage },
    );
  }

  return { status: 'success' };
};

const handleDiscordPinMessenger = async (
  models: IModels,
  doc: TInboxRelayDoc,
) => {
  const { integrationId, conversationId, messageId, remove } = doc;
  if (!messageId) {
    throw new Error('Message id is required');
  }
  const conversation = await models.DiscordConversations.findOne({
    erxesApiId: conversationId,
  });
  const bot = await models.DiscordBots.findOne({
    erxesApiId: integrationId,
  }).sort({ createdAt: -1 });
  if (!conversation?.channelId || !bot?.token) {
    throw new Error('Discord conversation is unavailable');
  }

  const updatePin = remove ? unpinChannelMessage : pinChannelMessage;
  try {
    await updatePin(bot.token, conversation.channelId, messageId);
  } catch (error) {
    if (error instanceof DiscordApiError && error.status === 403) {
      throw new Error(
        'The Discord bot needs the "Manage Messages" permission in this channel to pin messages. Re-authorize the bot or update the channel role override, then try again.',
      );
    }
    if (error instanceof DiscordApiError && error.status === 404) {
      throw new Error('This message no longer exists in the Discord channel');
    }
    throw error;
  }

  const inboxMessage = await models.ConversationMessages.findOne({
    conversationId,
    'extraData.discordMessageId': messageId,
  });
  if (inboxMessage) {
    inboxMessage.extraData = {
      ...(inboxMessage.extraData),
      discordPinned: !remove,
    };
    await inboxMessage.save();
    await graphqlPubsub.publish(
      `conversationMessageInserted:${conversationId}`,
      { conversationMessageInserted: inboxMessage },
    );
  }

  return { status: 'success', pinned: !remove };
};

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

  if (action === 'react-messenger') {
    return handleDiscordReactMessenger(models, doc);
  }

  if (action === 'pin-messenger') {
    return handleDiscordPinMessenger(models, doc);
  }

  if (action === 'reply-messenger') {
    return handleDiscordReplyMessenger(models, subdomain, doc);
  }

  return { status: 'success' };
};
