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
        isCustom: true,
        description:
          'Start with a blank workflow that enralls and is triggered off facebook messages',
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
};

const generatePayloadString = (conversation, btn, customerId) => {
  return JSON.stringify({
    btnId: btn._id,
    conversationId: conversation._id,
    customerId,
  });
};

const generateMessage = async (
  models: IModels,
  config,
  conversation: IConversation,
  senderId,
) => {
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

  if (config?.messageTemplates?.length > 1) {
    return {
      attachment: {
        type: 'template',
        payload: {
          template_type: 'generic',
          elements: config.messageTemplates.map((temp) => ({
            title: temp.title,
            subtitle: temp.description,
            image_url: readFileUrl(temp?.image?.url),
            buttons: generateButtons(temp?.buttons),
          })),
        },
      },
    };
  }

  if (config?.messageTemplates?.length === 1) {
    const messageTemplate = config.messageTemplates[0];

    return {
      attachment: {
        type: 'template',
        payload: {
          template_type: 'button',
          text: messageTemplate?.title,
          buttons: generateButtons(messageTemplate?.buttons),
        },
      },
    };
  }

  if (config?.quickReplies) {
    const quickReplies = config?.quickReplies || [];

    return {
      text: config?.text,
      quick_replies: quickReplies.map((quickReply) => ({
        content_type: 'text',
        title: quickReply.label,
        payload: generatePayloadString(
          conversation,
          quickReply,
          customer?.erxesApiId,
        ),
      })),
    };
  }

  if (config?.text) {
    return {
      text: config.text,
    };
  }
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
