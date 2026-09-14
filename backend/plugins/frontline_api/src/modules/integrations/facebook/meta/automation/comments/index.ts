import { generateModels, IModels } from '~/connectionResolvers';
import { debugError } from '@/integrations/facebook/debuggers';
import { queueCommentReply } from '@/integrations/facebook/commentOutbox';
import { checkContentConditions } from '@/integrations/facebook/meta/automation/utils/messageUtils';

/**
 * Meta restricts pages "posting repetitive content", and a single template can
 * appear thousands of times under one post. Variants are picked at random so no
 * single sentence dominates a thread.
 */
const pickReplyText = (config: { text?: string; texts?: string[] }) => {
  const texts = (config?.texts || []).filter((text) => Boolean(text?.trim()));

  if (!texts.length) {
    // Automations saved before variants existed carry a single `text`.
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
    const { attachments, mentionSender } = config;
    const text = pickReplyText(config);

    const inboxConversation = await models.Conversations.findOne({
      _id: erxesApiId,
    });

    if (!inboxConversation) {
      throw new Error('No inbox conversation found');
    }

    const sendBlock = await models.FacebookBots.getSendBlock(recipientId);

    if (sendBlock) {
      return {
        status: 'skipped',
        reason: 'send-blocked',
        blockedUntil: sendBlock.until,
        blockReason: sendBlock.reason,
      };
    }

    const { jobId, delay } = await queueCommentReply(models, subdomain, {
      executionId: execution._id,
      actionId: action.id,
      pageId: recipientId,
      postId: target?.postId,
      commentId: comment_id,
      senderId,
      integrationId: inboxConversation.integrationId,
      text,
      attachments,
      mentionSender: !!mentionSender,
    });

    // The engine records the action as queued and moves on; the outbox worker
    // reports the outcome once the reply actually goes out.
    return {
      deferred: { jobId, mode: 'ignore', timeoutMinutes: 60 },
      result: { status: 'queued', text, sendAfterMs: delay },
    };
  } catch (error) {
    debugError(error.message);
    throw new Error(error.message);
  }
};

export const checkCommentTrigger = async (subdomain, { target, config }) => {
  const { botId, postId, postType, checkContent, conditions, onlyFirstLevel } =
    config || {};

  if (
    !target?.recipientId ||
    !target?.postId ||
    !target?.comment_id ||
    !target?.senderId ||
    !target?.customerId
  ) {
    return false;
  }

  const models = await generateModels(subdomain);

  const bot = await models.FacebookBots.findOne(
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

  if (
    onlyFirstLevel &&
    target.parentId &&
    String(target.parentId) !== String(target.postId)
  ) {
    return false;
  }

  return !checkContent
    ? true
    : checkContentConditions(target?.content || '', conditions);
};
