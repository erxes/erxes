import { IModels } from '../connectionResolver';
import { debugError } from '../debuggers';
import { sendInboxMessage } from '../messageBroker';
import { IConversation } from '../models/definitions/conversations';
import { ICustomer } from '../models/definitions/customers';
import { sendReply } from '../utils';
import {
  generateBotData,
  generatePayloadString,
  checkContentConditions,
} from './utils';
import * as moment from 'moment';
import { getEnv } from '../commonUtils';

const generateMessages = async (
  config: any,
  conversation: IConversation,
  customer: ICustomer,
) => {
  let { messages = [] } = config || {};

  const generateButtons = (buttons: any[] = []) => {
    const generatedButtons: any = [];

    for (const button of buttons) {
      const obj: any = {
        type: 'postback',
        title: button.text,
        payload: generatePayloadString(
          conversation,
          button,
          customer?.erxesApiId,
        ),
      };

      if (button.link) {
        delete obj.payload;
        obj.type = 'web_url';
        obj.url = button.link;
      }

      generatedButtons.push(obj);
    }

    return generatedButtons;
  };

  const getUrl = (key) => {
    const DOMAIN = getEnv({
      name: 'DOMAIN',
    });

    return `${DOMAIN}/read-file?key=${key}`;
  };

  const quickRepliesIndex = messages.findIndex(
    ({ type }) => type === 'quickReplies',
  );

  if (quickRepliesIndex !== -1) {
    const quickRepliesMessage = messages.splice(quickRepliesIndex, 1)[0];
    messages.push(quickRepliesMessage);
  }
  const generatedMessages: any[] = [];

  for (const {
    type,
    buttons,
    text,
    cards = [],
    quickReplies,
    image = '',
    video = '',
    audio = '',
    input,
  } of messages) {
    const botData = generateBotData({
      type,
      buttons,
      text,
      cards,
      quickReplies,
      image,
    });

    if (['text', 'input'].includes(type) && !buttons?.length) {
      generatedMessages.push({
        text: input ? input.text : text,
        botData,
        inputData: input,
      });
    }

    if (['text', 'input'].includes(type) && !!buttons?.length) {
      generatedMessages.push({
        attachment: {
          type: 'template',
          payload: {
            template_type: 'button',
            text: input ? input.text : text,
            buttons: generateButtons(buttons),
          },
        },
        botData,
        inputData: input,
      });
    }

    if (type === 'card' && cards?.length > 0) {
      generatedMessages.push({
        attachment: {
          type: 'template',
          payload: {
            template_type: 'generic',
            elements: cards.map(
              ({ title = '', subtitle = '', image = '', buttons = [] }) => ({
                title,
                subtitle,
                image_url: getUrl(image),
                buttons: generateButtons(buttons),
              }),
            ),
          },
        },
        botData,
      });
    }

    if (type === 'quickReplies') {
      generatedMessages.push({
        text: text || '',
        quick_replies: quickReplies.map((quickReply) => ({
          content_type: 'text',
          title: quickReply?.text || '',
          payload: generatePayloadString(
            conversation,
            quickReply,
            customer?.erxesApiId,
          ),
        })),
        botData,
      });
    }

    if (['image', 'audio', 'video'].includes(type)) {
      const url = image || video || audio;

      url &&
        generatedMessages.push({
          attachment: {
            type,
            payload: {
              url: getUrl(url),
            },
          },
          botData,
        });
    }
  }

  return generatedMessages;
};

export const checkMessageTrigger = (subdomain, { target, config }) => {
  const { conditions = [], botId } = config;
  if (target.botId !== botId) {
    return;
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

      if (type === 'persistentMenu' && target?.payload) {
        const { persistentMenuId } = target.payload || {};

        if ((persistentMenuIds || []).includes(String(persistentMenuId))) {
          return true;
        }
      }

      if (type === 'direct' && directMessageCondtions?.length > 0) {
        if (
          checkContentConditions(target?.content || '', directMessageCondtions)
        ) {
          return true;
        }
      }
    }
    continue;
  }
};

const generateObjectToWait = ({
  messages = [],
  optionalConnects = [],
  conversation,
  customer,
}: {
  messages: any[];
  optionalConnects: any[];
  conversation: { _id: string } & IConversation;
  customer: ICustomer;
}) => {
  const obj: any = {};
  const general: any = {
    conversationId: conversation._id,
    customerId: customer.erxesApiId,
  };
  let propertyName = 'payload.btnId';

  if (messages.some((msg) => msg.type === 'input')) {
    const inputMessageConfig =
      messages.find((msg) => msg.type === 'input')?.input || {};

    if (inputMessageConfig.timeType === 'day') {
      obj.startWaitingDate = moment()
        .add(inputMessageConfig.value || 0, 'day')
        .toDate();
    }

    if (inputMessageConfig.timeType === 'hour') {
      obj.startWaitingDate = moment()
        .add(inputMessageConfig.value || 0, 'hour')
        .toDate();
    }
    if (inputMessageConfig.timeType === 'minute') {
      obj.startWaitingDate = moment()
        .add(inputMessageConfig.value || 0, 'minute')
        .toDate();
    }

    const actionIdIfNotReply =
      optionalConnects.find(
        (connect) => connect?.optionalConnectId === 'ifNotReply',
      )?.actionId || null;

    obj.waitingActionId = actionIdIfNotReply;

    propertyName = 'botId';
  }

  return {
    ...obj,
    objToCheck: {
      propertyName,
      general,
    },
  };
};

export const actionCreateMessage = async (
  models: IModels,
  subdomain,
  action,
  execution,
) => {
  const { target } = execution || {};
  const { config } = action || {};

  const conversation = await models.Conversations.findOne({
    _id: target?.conversationId,
  });

  if (!conversation) {
    return;
  }

  const integration = await models.Integrations.findOne({
    _id: conversation.integrationId,
  });

  if (!integration) {
    return;
  }
  const { recipientId, senderId, botId } = conversation;

  const customer = await models.Customers.findOne({ userId: senderId }).lean();

  if (!customer) {
    return;
  }

  let result: any[] = [];

  try {
    const messages = await generateMessages(config, conversation, customer);

    if (!messages?.length) {
      return;
    }

    for (const { botData, inputData, ...message } of messages) {
      await sendReply(
        models,
        'me/messages',
        {
          recipient: { id: senderId },
          sender_action: 'typing_on',
        },
        recipientId,
        integration.erxesApiId,
      );

      const resp = await sendReply(
        models,
        'me/messages',
        {
          recipient: { id: senderId },
          message,
        },
        recipientId,
        integration.erxesApiId,
      );

      if (!resp) {
        return;
      }

      const conversationMessage = await models.ConversationMessages.addMessage({
        conversationId: conversation._id,
        content: '<p>Bot Message</p>',
        internal: false,
        mid: resp.message_id,
        botId,
        botData,
        fromBot: true,
      });

      await sendInboxMessage({
        subdomain,
        action: 'conversationClientMessageInserted',
        data: {
          ...conversationMessage.toObject(),
          conversationId: conversation.erxesApiId,
        },
      });

      result.push(conversationMessage);
    }

    const { optionalConnects = [] } = config;

    if (!optionalConnects?.length) {
      return result;
    }

    return {
      result,
      objToWait: generateObjectToWait({
        messages: config?.messages || [],
        conversation,
        customer,
        optionalConnects,
      }),
    };
  } catch (error) {
    debugError(error.message);
  }
};
