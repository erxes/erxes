import { readFileUrl } from '@erxes/api-utils/src/commonUtils';
import { IModels, generateModels } from './connectionResolver';
import { debugError } from './debuggers';
import { IConversation } from './models/definitions/conversations';
import { sendReply } from './utils';
import { sendInboxMessage } from './messageBroker';
import { lastIndexOf } from './essyncer';

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

    console.log({ collectionType, botId, target });

    if (collectionType === 'messages') {
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
            const { persistenceMenuId } = target.payload || {};

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
              console.log({ result: true });
              return true;
            }
            console.log({ result: false });
          }
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
  let { messages = [] } = config || {};

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
  } of messages) {
    const botData = generateBotData({
      type,
      buttons,
      text,
      cards,
      quickReplies,
      image,
    });

    if (type === 'text' && !buttons?.length) {
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

    if (type === 'image') {
      generatedMessages.push({
        attachment: {
          type: 'image',
          payload: {
            url: readFileUrl(image),
          },
        },
        botData,
      });
    }
  }

  return generatedMessages;
};

const generateBotData = ({
  type,
  buttons,
  text,
  cards,
  quickReplies,
  image,
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

  const customer = await models.Customers.findOne({ userId: senderId });

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
