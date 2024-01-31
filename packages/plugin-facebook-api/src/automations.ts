import { readFileUrl } from '@erxes/api-utils/src/commonUtils';
import { IModels, generateModels } from './connectionResolver';
import { debugError } from './debuggers';
import { IConversation } from './models/definitions/conversations';
import { sendReply } from './utils';
import { sendInboxMessage } from './messageBroker';

export default {
  constants: {
    actions: [
      {
        type: 'facebook:messages.create',
        icon: 'messenger',
        label: 'Send Facebook Message',
        description: 'Send Facebook Message',
        isAvailable: true,
        isAvailableOptionalConnect: true,
      },
    ],
    triggers: [
      {
        type: 'facebook:messages',
        img: 'automation3.svg',
        icon: 'file-plus-alt',
        label: 'Facebook Message',
        description:
          'Start with a blank workflow that enralls and is triggered off facebook messages',
        isCustom: true,
        conditions: [
          {
            type: 'getStarted',
            label: 'Get Started',
            icon: 'messenger',
            description: 'User click on get started on the messenger',
          },
          {
            type: 'persistentMenu',
            label: 'Persistent menu',
            icon: 'menu-2',
            description: 'User click on persistent menu on the messenger',
          },
          {
            type: 'direct',
            icon: 'messenger',
            label: 'Direct Message',
            description: 'User sends direct message with keyword',
          },
        ],
      },
    ],
  },
  receiveActions: async ({
    subdomain,
    data: { action, execution, actionType, collectionType },
  }) => {
    const models = await generateModels(subdomain);

    if (actionType === 'create' && collectionType === 'messages') {
      return await actionCreateMessage(models, subdomain, action, execution);
    }

    return;
  },
  checkCustomTrigger: async ({
    subdomain,
    data: { collectionType, target, config },
  }) => {
    const { conditions = [], botId } = config;

    if (collectionType === 'messages') {
      if (target.botId === botId) {
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
            const { persistenceMenuId } = JSON.parse(target?.payload || '{}');

            if ((persistentMenuIds || []).includes(persistenceMenuId)) {
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
              return true;
            }
            continue;
          }
          continue;
        }
        continue;
      }
    }

    return;
  },
};

const checkDirectMessageConditions = (content: string, conditions: any[]) => {
  for (const cond of conditions || []) {
    const keywords = (cond?.keywords || [])
      .map((keyword) => keyword.text)
      .filter((keyword) => keyword);
    const regexPattern = new RegExp(keywords.join('|'), 'i');

    switch (cond?.operator || '') {
      case 'every':
        return keywords.every((_keyword) => regexPattern.test(content));
      case 'some':
        return keywords.some((_keyword) => regexPattern.test(content));
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

const generatePayloadString = (conversation, btn, customerId) => {
  return JSON.stringify({
    btnId: btn._id,
    conversationId: conversation._id,
    customerId,
  });
};

const generateMessages = async (
  models: IModels,
  config,
  conversation: IConversation,
  senderId,
) => {
  const { messages = [] } = config || {};

  const customer = await models.Customers.findOne({ userId: senderId }).lean();

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

  const generatedMessages = messages.map(
    ({ type, buttons, text, cards = [], quickReplies, image = '' }) => {
      if (type === 'text' && buttons?.length > 0) {
        return {
          text,
        };
      }

      if (type === 'text' && !!buttons?.length) {
        return {
          attachment: {
            type: 'template',
            payload: {
              template_type: 'button',
              text,
              buttons: generateButtons(buttons),
            },
          },
        };
      }

      if (type === 'cards') {
        return {
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
        };
      }

      if (type === 'quickReplies') {
        return {
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
        };
      }

      if (type === 'image') {
        return {
          attachment: {
            type: 'image',
            payload: {
              url: image,
            },
          },
        };
      }
    },
  );

  return generatedMessages;
};

const generateBotData = ({
  type,
  buttons,
  text,
  cards = [],
  quickReplies,
  image = '',
}) => {
  let botData: any[] = [];

  const generateButtons = (buttons: any[]) => {
    return buttons.map((btn: any) => ({
      title: btn.text,
      url: btn.link || null,
      type: btn.link ? 'openUrl' : null,
    }));
  };

  if (type === 'card') {
    botData.push({
      type: 'carousel',
      elements: cards.map(
        ({
          title = '',
          subtitle = '',
          image = '',
          buttons: cardButtons = [],
        }) => ({
          picture: readFileUrl(image),
          title,
          subtitle,
          buttons: generateButtons(cardButtons),
        }),
      ),
    });
  }

  if (type === 'quickReplies') {
    botData.push({
      type: 'custom',
      component: 'QuickReplies',
      quick_replies: quickReplies.map(({ text }) => ({
        title: text,
      })),
    });
  }

  if (type === 'image') {
    botData.push({
      type: 'file',
      url: readFileUrl(image),
    });
  }

  if (type === 'text' && buttons?.length > 0) {
    botData.push({
      type: 'carousel',
      elements: [{ title: text, buttons: generateButtons(buttons) }],
    });
  }

  if (type === 'text') {
    botData.push({
      type: 'text',
      text: `<p>${text}</p>`,
    });
  }

  return botData;
};

const actionCreateMessage = async (
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

  const customer = await models.Customers.findOne({ userId: recipientId });

  if (!customer) {
    return;
  }

  let result: any[] = [];

  try {
    const messages = await generateMessages(
      models,
      config,
      conversation,
      senderId,
    );

    for (const message of messages) {
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
        botData: generateBotData(message),
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
          propertyName: 'payload.btnId',
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
