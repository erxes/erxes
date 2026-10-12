import type { IModels } from '~/connectionResolvers';
import { getErrorMessage } from '@/integrations/discord/utils/request';
import { resolveAttachmentUrl } from '@/integrations/discord/utils/media/attachments';
import { sendChannelMessage } from '@/integrations/discord/utils/outbound/send';
import {
  type DiscordMessageAttachment,
  type DiscordPollRequest,
} from '@/integrations/discord/@types/outgoingMessage';
import { debugError } from '@/integrations/discord/debuggers';
import {
  type TInboxRelayDoc,
  type TNativeForwardReference,
  type TInboxAttachment,
  type TComposerPoll,
} from '@/integrations/discord/@types/inboxRelay';

/** Resolve a stored Discord message to its native forwarding reference. */
export const resolveNativeForwardReference = async (
  models: IModels,
  forwardedFrom?: NonNullable<TInboxRelayDoc['extraInfo']>['forwardedFrom'],
): Promise<TNativeForwardReference | undefined> => {
  if (!forwardedFrom?.messageId || !forwardedFrom.conversationId) {
    return undefined;
  }
  const sourceInboxMessage = await models.ConversationMessages.findOne({
    _id: forwardedFrom.messageId,
    conversationId: forwardedFrom.conversationId,
  });
  if (sourceInboxMessage?.extraData?.poll) return undefined;
  const sourceMessageId =
    typeof sourceInboxMessage?.extraData?.discordMessageId === 'string'
      ? sourceInboxMessage.extraData.discordMessageId
      : undefined;
  if (!sourceMessageId) return undefined;
  const sourceConversation = await models.DiscordConversations.findOne({
    erxesApiId: forwardedFrom.conversationId,
  });
  if (!sourceConversation?.channelId) return undefined;
  return {
    type: 1,
    messageId: sourceMessageId,
    channelId: sourceConversation.channelId,
    guildId: sourceConversation.guildId,
  };
};

/** Turn inbox attachments into URLs and names accepted by Discord. */
export const resolveDiscordFiles = (
  subdomain: string,
  attachments: TInboxAttachment[],
): DiscordMessageAttachment[] =>
  attachments
    .filter((attachment): attachment is TInboxAttachment & { url: string } =>
      Boolean(attachment?.url),
    )
    .map((attachment) => ({
      url: resolveAttachmentUrl(subdomain, attachment.url),
      filename: attachment.name,
    }));

/** Load the reply target from the current Discord conversation. */
export const resolveReplyTarget = async (
  models: IModels,
  conversationId: string,
  replyToMessageId?: string,
) => {
  if (!replyToMessageId) return undefined;
  const repliedMessage = await models.DiscordConversationMessages.findOne({
    conversationId,
    messageId: replyToMessageId,
  });
  if (!repliedMessage || repliedMessage.deletedAt) {
    throw new Error('Reply target was not found in this Discord conversation');
  }
  return {
    messageId: replyToMessageId,
    content:
      repliedMessage?.content ||
      repliedMessage?.attachments?.[0]?.name ||
      'Original message unavailable',
  };
};

/** Send a Discord reply and surface API failures to the inbox. */
export const sendDiscordReply = async ({
  token,
  channelId,
  content,
  files,
  poll,
  messageReference,
}: {
  token: string;
  channelId: string;
  content: string;
  files?: DiscordMessageAttachment[];
  poll?: DiscordPollRequest;
  messageReference?: string | TNativeForwardReference;
}) => {
  try {
    return await sendChannelMessage({
      token,
      channelId,
      content,
      files,
      poll,
      messageReference,
    });
  } catch (error) {
    debugError(`Failed to send Discord reply: ${getErrorMessage(error)}`);
    throw new Error(getErrorMessage(error));
  }
};

export const buildPollRequest = (
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
