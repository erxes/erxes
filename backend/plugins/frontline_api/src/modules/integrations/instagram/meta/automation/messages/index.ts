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
  EXECUTE_WAIT_TYPES,
  IAutomationAction,
  IAutomationExecution,
  splitType,
} from 'erxes-api-shared/core-modules';
export const checkMessageTrigger = async (subdomain, { target, config }) => {
  const { conditions = [], botId } = config;
  if (target.botId !== botId) {
    return;
  }
  const payload = target?.payload || {};
  const { persistentMenuId, isBackBtn } = payload;
  if (persistentMenuId && isBackBtn) {
    sendWorkerQueue('automations', 'playWait').add('playWait', {
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
        } else if (target?.content) {
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

  if (
    moduleName !== 'facebook' &&
    !['messages', 'comments', 'ads'].includes(collectionType)
  ) {
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

  const result: any[] = [];

  try {
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

      const conversationMessage =
        await models.FacebookConversationMessages.addMessage({
          conversationId: conversation._id,
          content: '<p>Bot Message</p>',
          internal: false,
          mid: sendReplyResult.message_id,
          botId,
          botData,
          fromBot: true,
        });

      pConversationClientMessageInserted(subdomain, {
        ...conversationMessage,
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
