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
      },
      {
        type: 'facebook:comment.create',
        icon: 'comment-alt-redo',
        label: 'Reply Comment',
        description: 'Send Facebook Comment',
        isAvailable: true
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
      },
      {
        type: 'facebook:comments',
        img: 'automation3.svg',
        icon: 'file-plus-alt',
        label: 'Facebook Comment',
        description:
          'Start with a blank workflow that enralls and is triggered off facebook comment'
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

const generateMessageHtml = ({ messageTemplates, quickReplies, text }) => {
  if (messageTemplates?.length > 1) {
    const elementsHTML = messageTemplates
      .map(element => {
        const buttonsHTML = element.buttons
          .map(button => {
            return `<button type="button" class="generic-template-button" data-url="${readFileUrl(
              button?.url
            )}">${button.title}</button>`;
          })
          .join('');

        return `
      <div class="generic-template-element">
        <h2>${element.title || ''}</h2>
        <p>${element.description || ''}</p>
        <img src="${readFileUrl(element.image.url)}" alt="${element.title}">
        <div dangerouslySetInnerHTML={{__html:${buttonsHTML}}}/>
      </div>`;
      })
      .join('');

    const templateHTML = `<div class="generic-template-container">${elementsHTML}</div>`;

    return templateHTML;
  }
  if (messageTemplates?.length === 1) {
    const messageTemplate = messageTemplates[0];
    const buttonsHTML = messageTemplate?.buttons
      .map(button => {
        return `<button type="button" class="button-template" >${button.title}</button>`;
      })
      .join('');

    const templateHTML = `
    <div class="button-template-container">
      <p>${messageTemplate?.title}</p>
      <div dangerouslySetInnerHTML={{__html:${buttonsHTML}}}/>
    </div>`;

    return templateHTML;
  }
  if (quickReplies) {
    const buttonsHTML = quickReplies
      .map(reply => {
        return `<button type="button" class="quick-reply">${reply.label}</button>`;
      })
      .join('');

    const quickReplyContainerHTML = `<div class="quick-reply-container"><div dangerouslySetInnerHTML={{__html:${buttonsHTML}}}/></div>`;

    return quickReplyContainerHTML;
  }

  return `<p>${text}</p>`;
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
      console.log(resp);

      const conversationMessage = await models.ConversationMessages.addMessage(
        {
          // ...doc,
          // inbox conv id comes, so override
          // integrationId: integration.erxesApiId,
          conversationId: conversation._id,
          content: generateMessageHtml(config),
          internal: false,
          mid: resp.message_id,
          botId
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
