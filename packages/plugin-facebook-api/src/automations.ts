import { readFileUrl } from '@erxes/api-utils/src/commonUtils';
import { IModels, generateModels } from './connectionResolver';
import { debugError } from './debuggers';
import { IConversation } from './models/definitions/conversations';
import { sendReply } from './utils';
import { sendInboxMessage } from './messageBroker';
import { graphqlPubsub } from './configs';

export default {
  constants: {
    actions: [
      {
        type: 'facebook:messages.create',
        icon: 'messenger',
        label: 'Send Facebook Message',
        description: 'Send Facebook Message',
        isAvailable: true,
        isAvailableOptionalConnect: true
      }
    ],
    triggers: [
      {
        type: 'facebook:messages',
        img: 'automation3.svg',
        icon: 'file-plus-alt',
        label: 'Facebook Message',
        description:
          'Start with a blank workflow that enralls and is triggered off facebook messages'
      }
    ]
  },
  receiveActions: async ({
    subdomain,
    data: { action, execution, actionType, collectionType }
  }) => {
    const models = await generateModels(subdomain);

    if (actionType === 'create' && collectionType === 'messages') {
      return await actionCreateMessage(models, subdomain, action, execution);
    }

    return;
  }
};

const generatePayloadString = (conversation, btn, customerId) => {
  return JSON.stringify({
    btnId: btn._id,
    conversationId: conversation._id,
    customerId
  });
};

const generateMessage = async (
  models: IModels,
  config,
  conversation: IConversation,
  senderId
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
          customer?.erxesApiId
        )
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
          elements: config.messageTemplates.map(temp => ({
            title: temp.title,
            subtitle: temp.description,
            image_url: readFileUrl(temp?.image?.url),
            buttons: generateButtons(temp?.buttons)
          }))
        }
      }
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
          buttons: generateButtons(messageTemplate?.buttons)
        }
      }
    };
  }

  if (config?.quickReplies) {
    const quickReplies = config?.quickReplies || [];

    return {
      text: config?.text,
      quick_replies: quickReplies.map(quickReply => ({
        content_type: 'text',
        title: quickReply.label,
        payload: generatePayloadString(
          conversation,
          quickReply,
          customer?.erxesApiId
        )
      }))
    };
  }

  if (config?.text) {
    return {
      text: config.text
    };
  }
};

const generateBotData = ({ messageTemplates, quickReplies, text }) => {
  if (messageTemplates?.length > 1) {
    return [
      {
        type: 'carousel',
        elements: messageTemplates.map(
          ({ title, description, image, buttons }) => ({
            picture: readFileUrl(image.url),
            title,
            subtitle: description,
            buttons: buttons.map(btn => ({
              title: btn.text,
              url: btn.link || null,
              type: btn.link ? 'openUrl' : null
            }))
          })
        )
      }
    ];
  }

  if (messageTemplates?.length === 1) {
    return [
      {
        type: 'carousel',
        elements: messageTemplates.map(({ title, buttons }) => ({
          title,
          buttons: buttons.map(btn => ({
            title: btn.text,
            url: btn.link || null,
            type: btn.link ? 'openUrl' : null
          }))
        }))
      }
    ];
  }
  if (quickReplies) {
    return [
      {
        type: 'custom',
        component: 'QuickReplies',
        quick_replies: quickReplies.map(qReplies => ({
          title: qReplies.label
        }))
      }
    ];
  }

  return [
    {
      type: 'text',
      text: `<p>${text}</p>`
    }
  ];
};

const actionCreateMessage = async (
  models: IModels,
  subdomain,
  action,
  execution
) => {
  const { target } = execution || {};
  const { config } = action || {};

  const conversation = await models.Conversations.findOne({
    _id: target?.conversationId
  });

  if (!conversation) {
    return;
  }

  const integration = await models.Integrations.findOne({
    _id: conversation.integrationId
  });

  if (!integration) {
    return;
  }
  const { recipientId, senderId, botId } = conversation;

  try {
    const message = await generateMessage(
      models,
      config,
      conversation,
      senderId
    );

    if (!message) {
      return;
    }

    const resp = await sendReply(
      models,
      'me/messages',
      {
        recipient: { id: senderId },
        message
      },
      recipientId,
      integration.erxesApiId
    );

    if (resp) {
      const conversationMessage = await models.ConversationMessages.addMessage(
        {
          // ...doc,
          // inbox conv id comes, so override
          conversationId: conversation._id,
          content: '<p>Bot Message</p>',
          internal: false,
          mid: resp.message_id,
          botId,
          botData: generateBotData(config),
          fromBot: true
        },
        config.fromUserId
      );

      await sendInboxMessage({
        subdomain,
        action: 'conversationClientMessageInserted',
        data: {
          ...conversationMessage.toObject(),
          conversationId: conversation.erxesApiId
        }
      });

      graphqlPubsub.publish('conversationMessageInserted', {
        conversationMessageInserted: {
          ...conversationMessage.toObject(),
          conversationId: conversation.erxesApiId
        }
      });

      const { optionalConnects = [] } = config;

      if (optionalConnects?.length > 0) {
        return {
          result: conversationMessage,
          objToWait: {
            objToCheck: {
              propertyName: 'payload.btnId',
              general: {
                conversationId: conversation._id,
                customerId: conversationMessage.customerId
              }
            }
          }
        };
      }

      return conversationMessage;
    }
  } catch (error) {
    debugError(error.message);
  }
};
