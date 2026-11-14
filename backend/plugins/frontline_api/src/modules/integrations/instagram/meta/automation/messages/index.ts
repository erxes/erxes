import { debugError } from '@/integrations/instagram/debuggers';
import { checkContentConditions } from '@/integrations/instagram/meta/automation/utils/messageUtils';
import { IModels } from '~/connectionResolvers';
import { generateMessages, getData, sendMessage } from './utils';
import { IInstagramConversationDocument } from '../../../@types/conversations';
import { IInstagramCustomerDocument } from '../../../@types/customers';
import { TAutomationActionConfig } from '@/integrations/instagram/meta/automation/types/automationTypes';
import { sendWorkerQueue } from 'erxes-api-shared/utils';
import { pConversationClientMessageInserted } from '@/inbox/graphql/resolvers/mutations/widget';
import {
  AutomationExecutionSetWaitCondition,
  buildSkippedAction,
  EXECUTE_WAIT_TYPES,
  IAutomationAction,
  IAutomationExecution,
  replaceOutputPlaceholders,
  splitType,
} from 'erxes-api-shared/core-modules';
import { hasReplyableMedia } from '@/integrations/facebook/meta/automation/utils/turnTaking';
import { hasNewerCustomerMessage } from '@/integrations/instagram/meta/automation/utils/turnTaking';
import { resolveInstagramActionConfigTemplates } from '@/integrations/instagram/meta/automation/utils/templates';
import { generateModels } from '~/connectionResolvers';
import { isAutomatedReplyPaused } from '@/inbox/services/automatedReplyPause';
import { resolveInboxConversationId } from '@/ticket/utils/conversationTickets';

export const checkMessageTrigger = async (subdomain, { target, config }) => {
  const { conditions = [], botId } = config;
  if (target.botId !== botId) {
    return;
  }

  const models = await generateModels(subdomain);

  // A person has taken over the conversation: the bot stays out of it.
  const inboxConversationId = await resolveInboxConversationId(
    models,
    target?.conversationId,
  );

  if (
    inboxConversationId &&
    (await isAutomatedReplyPaused(
      models,
      await models.Conversations.findOne(
        { _id: inboxConversationId },
        { automatedReplyControl: 1 },
      ).lean(),
    ))
  ) {
    return false;
  }

  const payload = target?.payload || {};
  const { persistentMenuId, isBackBtn } = payload;
  if (persistentMenuId && isBackBtn) {
    sendWorkerQueue('automations', 'action').add('executePrevAction', {
      subdomain,
      data: {
        query: {
          triggerType: 'instagram:messages',
          'target.botId': botId,
          'target.conversationId': target.conversationId,
          'target.customerId': target.customerId,
        },
      },
    });
  }

  for (const {
    isSelected,
    type,
    persistentMenuIds,
    conditions: directMessageCondtions = [],
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
        if (directMessageCondtions?.length > 0) {
          return !!checkContentConditions(
            target?.content || '',
            directMessageCondtions,
          );
        }

        if (await hasNewerCustomerMessage(models, target)) {
          return false;
        }

        if (
          String(target?.content || '').trim() ||
          hasReplyableMedia(target?.attachments)
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

  if (!['messages', 'comments', 'ads'].includes(collectionType)) {
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
  } = await getData(models, subdomain, collectionType, target, triggerConfig);

  if (
    collectionType === 'messages' &&
    execution.actions?.some(({ actionType }) => actionType === 'aiAgent') &&
    (await hasNewerCustomerMessage(models, target))
  ) {
    return buildSkippedAction('superseded-by-newer-message', {
      messageId: target?._id,
    });
  }

  const result: any[] = [];

  try {
    const outputResolvedValues = await replaceOutputPlaceholders({
      subdomain,
      execution,
      values: { config: config || {} },
      keepUnresolvedPlaceholders: true,
    });
    const resolvedConfig = resolveInstagramActionConfigTemplates(
      outputResolvedValues.config as TAutomationActionConfig,
      { prevAction: execution.actions?.at(-1)?.result },
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

      const conversationMessage =
        await models.InstagramConversationMessages.addMessage({
          conversationId: conversation._id,
          content: '<p>Bot Message</p>',
          internal: false,
          mid: sendReplyResult.message_id,
          botId,
          botData,
          fromBot: true,
        });

      pConversationClientMessageInserted(subdomain, {
        ...conversationMessage.toObject(),
        conversationId: conversation.erxesApiId,
      });

      result.push(conversationMessage);
    }

    const { optionalConnects = [] } = config || {};

    if (!optionalConnects?.length) {
      return result;
    }
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

const generateConditionWaitToAction = ({
  config,
  customer,
  conversation,
}: {
  config: any;
  conversation: IInstagramConversationDocument;
  customer: IInstagramCustomerDocument;
}): AutomationExecutionSetWaitCondition => {
  return {
    type: EXECUTE_WAIT_TYPES.CHECK_OBJECT,
    propertyName: 'payload.btnId',
    expectedState: {
      conversationId: conversation._id,
      customerId: customer.erxesApiId,
    },
    shouldCheckOptionalConnect: true,
  };
};
