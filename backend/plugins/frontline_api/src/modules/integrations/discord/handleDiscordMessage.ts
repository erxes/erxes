import { APIMessage } from 'discord-api-types/v10';
import { stripHtml } from 'string-strip-html';
import { IModels } from '~/connectionResolvers';
import {
  DiscordMessageAttachment,
  DiscordPollRequest,
  getDiscordUser,
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

  const toName = (_m: string, id: string) => `@${nameByUserId.get(id) || 'user'}`;

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
    },
  };
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

  if (action === 'reply-messenger') {
    return handleDiscordReplyMessenger(models, subdomain, doc);
  }

  return { status: 'success' };
};
