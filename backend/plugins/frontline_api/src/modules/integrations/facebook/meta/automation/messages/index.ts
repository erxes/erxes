import { pConversationClientMessageInserted } from '@/inbox/graphql/resolvers/mutations/widget';
import { debugError } from '@/integrations/facebook/debuggers';
import { checkContentConditions } from '@/integrations/facebook/meta/automation/utils/messageUtils';
import {
  IAction,
  IAutomationExecution,
  splitType,
} from 'erxes-api-shared/core-modules';
import { AutomationExecutionSetWaitCondition } from 'erxes-api-shared/core-modules';
import { sendWorkerQueue } from 'erxes-api-shared/utils';
import { IModels } from '~/connectionResolvers';
import { IFacebookConversationDocument } from '@/integrations/facebook/@types/conversations';
import { IFacebookCustomerDocument } from '@/integrations/facebook/@types/customers';
import { TBotConfigMessage } from '@/integrations/facebook/meta/automation/types/automationTypes';
import { generateMessages, getData, sendMessage } from './utils';

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
        } else if (!!target?.content) {
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
  action: IAction;
  execution: { _id: string } & IAutomationExecution;
}) => {
  const {
    target,
    triggerType,
    triggerConfig,
    _id: executionId,
  } = execution || {};
  const { config } = (action || {}) as {
    config: {
      botId: string;
      messages: TBotConfigMessage[];
      optionalConnects: {
        sourceId: string;
        actionId: string;
        optionalConnectId: string;
      }[];
    };
  };
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

  let result: any[] = [];

  try {
    const messages = await generateMessages(
      subdomain,
      config,
      conversation,
      customer,
      executionId,
    );

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

    const { optionalConnects = [] } = config;

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
  conversation: IFacebookConversationDocument;
  customer: IFacebookCustomerDocument;
}): AutomationExecutionSetWaitCondition => {
  return {
    type: 'checkObject',
    propertyName: 'payload.btnId',
    expectedState: {
      conversationId: conversation._id,
      customerId: customer.erxesApiId,
    },
    shouldCheckOptionalConnect: true,
  };
};
