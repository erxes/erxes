import { debugError } from '@/integrations/facebook/debuggers';
import { TAutomationActionConfig } from '@/integrations/facebook/meta/automation/types/automationTypes';
import { checkContentConditions } from '@/integrations/facebook/meta/automation/utils/messageUtils';
import {
  IAutomationAction,
  IAutomationExecution,
  splitType,
} from 'erxes-api-shared/core-modules';
import { sendWorkerQueue } from 'erxes-api-shared/utils';
import { IModels } from '~/connectionResolvers';
import { IFacebookConversationMessageDocument } from '../../../@types/conversationMessages';
import {
  generateConditionWaitToAction,
  generateMessages,
  getOrCreateFacebookMessageActionContext,
  sendMessage,
} from './utils';

export const checkMessageTrigger = async (
  subdomain: string,
  { target, config },
) => {
  const { conditions = [], botId } = config;

  if (target.botId !== botId) {
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
        } else if (!!target?.content) {
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

        if (openThreadSourceIds.some((sourceId) => sourceIds.includes(sourceId))) {
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
    let result: IFacebookConversationMessageDocument[] = [];

    const messages = await generateMessages({
      subdomain,
      conversation,
      customer,
      executionId,
      actionId,
      config,
    });

    if (!messages?.length) {
      throw new Error('There are no generated messages to send.');
    }

    for (const { botData, inputData, ...message } of messages) {
      const sendReplyResult = await sendMessage(models, bot, {
        senderId,
        recipientId,
        integration,
        message,
      });

      if (!sendReplyResult) {
        throw new Error('Something went wrong to send this message');
      }

      if (!conversation.erxesApiId) {
        throw new Error(
          'Conversation erxesApiId is required to create conversation message',
        );
      }

      const conversationMessage =
        await models.FacebookConversationMessages.addBotMessage(subdomain, {
          conversationId: conversation._id,
          botId,
          botData,
          mid: sendReplyResult.mid,
          conversationErxesApiId: conversation.erxesApiId,
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
        config,
        conversation,
        customer,
      }),
    };
  } catch (error) {
    debugError(error.message);
    throw new Error(error.message);
  }
};
