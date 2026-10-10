import type { APIMessage } from 'discord-api-types/v10';
import { stripHtml } from 'string-strip-html';
import type { IModels } from '~/connectionResolvers';
import { stopTypingIndicator } from '@/integrations/discord/utils/typing';
import {
  normalizeDiscordEmbeds,
  normalizeDiscordPoll,
} from '@/integrations/discord/utils/media/normalize';
import { type TInboxRelayDoc } from '@/integrations/discord/@types/inboxRelay';
import {
  buildPollRequest,
  resolveNativeForwardReference,
  resolveDiscordFiles,
  resolveReplyTarget,
  sendDiscordReply,
} from '@/integrations/discord/utils/outbound/replyPayload';
import { resolveMentionsForReply } from '@/integrations/discord/utils/outbound/replyMentions';

export const handleDiscordReplyMessenger = async (
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
    extraInfo,
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

  const nativeForwardReference = await resolveNativeForwardReference(
    models,
    extraInfo?.forwardedFrom,
  );

  const fallbackText = stripHtml(content).result.trim();
  const text = nativeForwardReference
    ? stripHtml(extraInfo?.forwardedNote || '').result.trim()
    : fallbackText;

  const files = resolveDiscordFiles(
    subdomain,
    Array.isArray(attachments) ? attachments : [],
  );

  if (!text && files.length === 0 && !pollRequest && !nativeForwardReference) {
    return { status: 'success' };
  }

  const { discordText, mirrorText, displayContent } =
    await resolveMentionsForReply(models, bot.token, text, content);

  const replyTo = await resolveReplyTarget(
    models,
    conversation._id,
    replyToMessageId,
  );
  const sent: APIMessage = await sendDiscordReply({
    token: bot.token,
    channelId: conversation.channelId,
    content: discordText,
    files: nativeForwardReference || !files.length ? undefined : files,
    poll: nativeForwardReference ? undefined : pollRequest,
    messageReference: nativeForwardReference || replyToMessageId,
  });

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
    attachmentIds: sent.attachments.map(({ id }) => id),
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
