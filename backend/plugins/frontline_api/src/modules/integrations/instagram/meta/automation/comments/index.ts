import { IModels, generateModels } from '~/connectionResolvers';
import { debugError } from '@/integrations/instagram/debuggers';
import { sendReplyComment } from '@/integrations/instagram/utils';
import { checkContentConditions } from '@/integrations/instagram/meta/automation/utils/messageUtils';
import { replaceMessageTemplateString } from '@/integrations/facebook/meta/automation/messages/utils';
import { replaceOutputPlaceholders } from 'erxes-api-shared/core-modules';

const pickReplyText = (config: { text?: string; texts?: string[] }) => {
  const texts = (config?.texts || []).filter((text) => Boolean(text?.trim()));

  if (!texts.length) {
    return config?.text || '';
  }

  return texts[Math.floor(Math.random() * texts.length)];
};

export const actionCreateComment = async (
  models: IModels,
  subdomain,
  action,
  execution,
) => {
  try {
    const { target = {} } = execution || {};
    const { config } = action || {};
    const { recipientId, comment_id, senderId, erxesApiId } = target;
    const { attachments } = config;

    const { text: outputResolvedText } = await replaceOutputPlaceholders({
      subdomain,
      execution,
      values: { text: pickReplyText(config) },
      keepUnresolvedPlaceholders: true,
    });
    const text = replaceMessageTemplateString(
      String(outputResolvedText ?? ''),
      { prevAction: execution.actions?.at(-1)?.result },
    );

    if (!text.trim() && !attachments?.length) {
      throw new Error('There is no reply text to send');
    }

    const inboxConversation = await models.Conversations.findOne({
      _id: erxesApiId,
    });

    if (!inboxConversation?.integrationId) {
      throw new Error('No inbox conversation found');
    }

    const data: { senderId: string; message: string; attachmentUrl?: string } =
      {
        senderId,
        message: text,
      };

    if (attachments?.length) {
      data.attachmentUrl = attachments[0].url;
    }

    await sendReplyComment(
      models,
      `${comment_id}/replies`,
      data,
      inboxConversation.integrationId,
    );

    await models.InstagramCommentConversationReply.create({
      recipientId,
      senderId,
      attachments,
      createdAt: new Date(),
      content: text,
      parentId: comment_id,
    });

    return { status: 'success', text };
  } catch (error) {
    debugError(error.message);
    throw new Error(error.message);
  }
};

export const checkCommentTrigger = async (subdomain, { target, config }) => {
  const { botId, postId, postType, checkContent, conditions, onlyFirstLevel } =
    config || {};

  if (!target?.recipientId || !target?.postId || !target?.comment_id) {
    return false;
  }

  const models = await generateModels(subdomain);

  const bot = await models.InstagramBots.findOne(
    {
      _id: botId,
      pageId: target?.recipientId,
    },
    { _id: 1 },
  ).lean();

  if (!bot) {
    return false;
  }

  if (postType === 'specific' && target.postId !== postId) {
    return false;
  }

  if (onlyFirstLevel && target.parentId) {
    return false;
  }

  return !checkContent
    ? true
    : checkContentConditions(target?.content || '', conditions);
};
