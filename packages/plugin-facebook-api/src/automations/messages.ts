import { readFileUrl } from '@erxes/api-utils/src/commonUtils';
import { IModels } from '../connectionResolver';
import { debugError } from '../debuggers';
import { sendInboxMessage } from '../messageBroker';
import { IConversation } from '../models/definitions/conversations';
import { ICustomer } from '../models/definitions/customers';
import { sendReply } from '../utils';
import { generateBotData, generatePayloadString } from './utils';

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
        text,
        botData,
      });
    }

    if (type === 'text' && !!buttons?.length) {
      generatedMessages.push({
        attachment: {
          type: 'template',
          payload: {
            template_type: 'button',
            text,
            buttons: generateButtons(buttons),
          },
        },
        botData,
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
                image_url: readFileUrl(image),
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
              url: readFileUrl(url),
            },
          },
          botData,
        });
    }
  }

  return generatedMessages;
};

const checkDirectMessageConditions = (content: string, conditions: any[]) => {
  for (const cond of conditions || []) {
    const keywords = (cond?.keywords || [])
      .map((keyword) => keyword.text)
      .filter((keyword) => keyword);

    switch (cond?.operator || '') {
      case 'every':
        return keywords.every((keyword) => content.includes(keyword));
      case 'some':
        return keywords.some((keyword) => content.includes(keyword));
      case 'isEqual':
        return keywords.some((keyword) => keyword === content);
      case 'isContains':
        return keywords.some((keyword) =>
          content.match(new RegExp(keyword, 'i')),
        );
      case 'startWith':
        return keywords.some((keyword) => content.startsWith(keyword));
      case 'endWith':
        return keywords.some((keyword) => content.endsWith(keyword));
      default:
        return;
    }
  }
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

        if ((persistentMenuIds || []).includes(persistentMenuId)) {
          return true;
        }
      }

      if (type === 'direct' && directMessageCondtions?.length > 0) {
        if (
          checkDirectMessageConditions(
            target?.content || '',
            directMessageCondtions,
          )
        ) {
          console.log({ result: true });
          return true;
        }
        console.log({ result: false });
      }
    }
    continue;
  }
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

    for (const { botData, ...message } of messages) {
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
      objToWait: {
        objToCheck: {
          propertyName: (config?.messages || []).some(
            (msg) => msg.type === 'input',
          )
            ? 'content'
            : 'payload.btnId',
          general: {
            conversationId: conversation._id,
            customerId: customer.erxesApiId,
          },
        },
      },
    };
  } catch (error) {
    debugError(error.message);
  }
};
