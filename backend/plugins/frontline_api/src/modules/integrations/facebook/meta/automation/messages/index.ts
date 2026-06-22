import { debugError } from '@/integrations/facebook/debuggers';
import { receiveInboxMessage } from '@/inbox/receiveMessage';
import { TAutomationActionConfig } from '@/integrations/facebook/meta/automation/types/automationTypes';
import { checkContentConditions } from '@/integrations/facebook/meta/automation/utils/messageUtils';
import {
  IAutomationAction,
  IAutomationExecution,
  replaceOutputPlaceholders,
  splitType,
} from 'erxes-api-shared/core-modules';
import { sendWorkerQueue } from 'erxes-api-shared/utils';
import { generateModels, IModels } from '~/connectionResolvers';
import { IFacebookConversationMessageDocument } from '../../../@types/conversationMessages';
import {
  generateConditionWaitToAction,
  generateMessages,
  getOrCreateFacebookMessageActionContext,
  resolveMessageActionConfigTemplates,
  sendMessage,
} from './utils';

const shouldSkipAutomatedReply = async (
  models: IModels,
  target: IFacebookConversationMessageDocument,
) => {
  const facebookConversation = await models.FacebookConversations.findOne({
    _id: target?.conversationId,
  }).lean();

  if (!facebookConversation?.erxesApiId) {
    return false;
  }

  const conversation = await models.Conversations.findOne({
    _id: facebookConversation.erxesApiId,
  }).lean();

  const control = conversation?.automatedReplyControl;

  if (!control || control.status === 'active') {
    return false;
  }

  const botId = target.botId || facebookConversation.botId;
  const bot = botId
    ? await models.FacebookBots.findOne(
        { _id: botId },
        { handoffPauseMinutes: 1 },
      ).lean()
    : null;
  const pauseMinutes = Math.max(1, Number(bot?.handoffPauseMinutes || 10));
  const previousMessage = await models.FacebookConversationMessages.findOne(
    {
      _id: { $ne: target._id },
      conversationId: target.conversationId,
    },
    { createdAt: 1 },
  )
    .sort({ createdAt: -1 })
    .lean();
  const currentMessageDate = target.createdAt
    ? new Date(target.createdAt)
    : new Date();
  const latestActivityDate = previousMessage?.createdAt
    ? new Date(previousMessage.createdAt)
    : control.updatedAt
    ? new Date(control.updatedAt)
    : undefined;
  const idleMs = latestActivityDate
    ? currentMessageDate.getTime() - latestActivityDate.getTime()
    : 0;

  if (idleMs >= pauseMinutes * 60 * 1000) {
    await models.Conversations.setAutomatedReplyControl(conversation._id, {
      status: 'active',
      reason: 'timeout_expired',
    });

    return false;
  }

  return ['handoff_requested', 'human_active'].includes(control.status);
};

export const checkMessageTrigger = async (
  subdomain: string,
  { target, config },
) => {
  const { conditions = [], botId } = config;

  if (target.botId !== botId) {
    return false;
  }

  const models = await generateModels(subdomain);

  if (await shouldSkipAutomatedReply(models, target)) {
    return false;
  }

  const payload = target?.payload || {};
  const { persistentMenuId, isBackBtn } = payload;
  if (persistentMenuId && isBackBtn) {
    sendWorkerQueue('automations', 'playWait').add('playWait', {
      subdomain,
      data: {
        query: {
          triggerType: 'facebook:messages',
          'target.botId': botId,
          'target.conversationId': target.conversationId,
          'target.customerId': target.customerId,
        },
      },
    });

    return false;
  }

  for (const {
    isSelected,
    type,
    persistentMenuIds,
    conditions: directMessageCondtions = [],
    sourceMode = 'all',
    sourceIds = [],
  } of conditions) {
    if (isSelected) {
      if (type === 'getStarted' && target.content === 'Get Started') {
        return true;
      }

      if (type === 'persistentMenu' && payload) {
        if ((persistentMenuIds || []).includes(String(persistentMenuId))) {
          return true;
        }
      }

      if (type === 'direct') {
        if (target.entryType === 'open_thread') {
          continue;
        }

        if (directMessageCondtions?.length > 0) {
          return !!checkContentConditions(
            target?.content || '',
            directMessageCondtions,
          );
        }

        // When no direct-message conditions are configured, any non-empty text
        // message should be able to trigger the automation.
        if (String(target?.content || '').trim()) {
          return true;
        }
      }

      if (type === 'open_thread') {
        if (target.entryType !== 'open_thread') {
          continue;
        }

        if (sourceMode === 'all') {
          return true;
        }

        const openThreadSourceIds = [
          target.openThread?.adId,
          target.openThread?.postId,
        ].filter(Boolean);

        if (
          openThreadSourceIds.some((sourceId) => sourceIds.includes(sourceId))
        ) {
          return true;
        }
      }
    }
    continue;
  }
};

export const actionCreateMessage = async ({
  models,
  subdomain,
  action,
  execution,
}: {
  models: IModels;
  subdomain: string;
  action: IAutomationAction<TAutomationActionConfig>;
  execution: { _id: string } & IAutomationExecution;
}) => {
  const {
    target,
    triggerType,
    triggerConfig,
    _id: executionId,
  } = execution || {};
  const { config, id: actionId } = action || {};
  const [_pluginName, moduleName, collectionType] = splitType(triggerType);

  if (moduleName !== 'facebook') {
    throw new Error('Unsupported module for this action');
  }

  if (!['messages', 'comments'].includes(collectionType)) {
    throw new Error('Unsupported trigger type');
  }

  const {
    conversation,
    customer,
    integration,
    bot,
    senderId,
    recipientId,
    botId,
  } = await getOrCreateFacebookMessageActionContext(
    models,
    subdomain,
    collectionType,
    target,
    triggerConfig,
  );

  try {
    const result: IFacebookConversationMessageDocument[] = [];
    const outputResolvedValues = await replaceOutputPlaceholders({
      subdomain,
      execution,
      values: { config: config || {} },
      keepUnresolvedPlaceholders: true,
    });
    const outputResolvedConfig =
      outputResolvedValues.config as TAutomationActionConfig;

    const resolvedConfig = resolveMessageActionConfigTemplates(
      outputResolvedConfig,
      {
        prevAction: execution.actions?.at(-1)?.result,
      },
    );

    const messages = await generateMessages({
      subdomain,
      conversation,
      customer,
      executionId,
      actionId,
      config: resolvedConfig,
    });

    if (!messages?.length) {
      throw new Error('There are no generated messages to send.');
    }

    const isCommentTrigger = collectionType === 'comments';
    const messagesToSend = isCommentTrigger ? messages.slice(0, 1) : messages;
    let didEnsureAutomatedReplyControl = false;
    const messageSource = isCommentTrigger
      ? {
          type: 'facebook_comment_private_reply',
          conversationId: target?.conversationId || target?.erxesApiId,
          messageId: target?._id,
          commentId: target?.comment_id,
          content: target?.content,
        }
      : undefined;

    for (const [
      index,
      { botData, inputData, ...message },
    ] of messagesToSend.entries()) {
      const sendReplyResult = await sendMessage(models, bot, {
        senderId,
        recipientId,
        integration,
        message,
        commentId:
          isCommentTrigger && index === 0 ? target?.comment_id : undefined,
      });

      if (!sendReplyResult) {
        throw new Error('Something went wrong to send this message');
      }

      if (!conversation.erxesApiId) {
        throw new Error(
          'Conversation erxesApiId is required to create conversation message',
        );
      }

      if (!didEnsureAutomatedReplyControl) {
        await receiveInboxMessage(subdomain, {
          action: 'ensure-automated-reply-control',
          payload: JSON.stringify({
            conversationId: conversation.erxesApiId,
          }),
        });
        didEnsureAutomatedReplyControl = true;
      }

      const conversationMessage =
        await models.FacebookConversationMessages.addBotMessage(subdomain, {
          conversationId: conversation._id,
          botId,
          botData,
          mid: sendReplyResult.message_id || sendReplyResult.mid,
          conversationErxesApiId: conversation.erxesApiId,
          source: messageSource,
        });

      result.push(conversationMessage);
    }

    const { optionalConnects = [] } = config || {};

    // If there are no optional connections, this action can finish immediately.
    if (!optionalConnects?.length) {
      return result;
    }
    // Otherwise, wait for the follow-up condition before continuing.
    return {
      result,
      waitCondition: generateConditionWaitToAction({
        conversation,
        customer,
      }),
    };
  } catch (error) {
    debugError(error.message);
    throw new Error(error.message);
  }
};
