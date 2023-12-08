import { readFileUrl } from '@erxes/api-utils/src/commonUtils';
import { IModels, generateModels } from './connectionResolver';
import { sendReply } from './utils';
import { IConversation } from './models/definitions/conversations';
import { sendAutomationsMessage } from './messageBroker';
import { debugError } from './debuggers';

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
    console.log('works', actionType, collectionType);
    const models = await generateModels(subdomain);

    if (actionType === 'create' && collectionType === 'messages') {
      return await actionCreateMessage(models, subdomain, action, execution);
    }

    return;
  }
};

const generatePayloadString = (conversation, btn) => {
  console.log(btn);

  return JSON.stringify({
    btnId: btn._id,
    erxesApiId: conversation.erxesApiId,
    recipientId: conversation.recipientId
  });
};

const generateMessage = (config, conversation: IConversation) => {
  if (config?.messageTemplates?.length > 1) {
    return {
      attachment: {
        type: 'template',
        payload: {
          template_type: 'generic',
          elements: config?.messageTemplates.map(temp => ({
            title: temp.title,
            subtitle: temp.description,
            image_url: readFileUrl(temp?.image?.url),
            buttons: (temp?.buttons || []).map(btn => ({
              type: 'postback',
              title: btn.text,
              payload: generatePayloadString(conversation, btn)
            }))
          }))
        }
      }
    };
  }

  if (config?.messageTemplates?.length === 1) {
    const messageTemplate = config?.messageTemplates[0];

    return {
      attachment: {
        type: 'template',
        payload: {
          template_type: 'button',
          text: messageTemplate?.title,
          buttons: (messageTemplate?.buttons || []).map(btn => ({
            type: 'postback',
            title: btn.text,
            payload: generatePayloadString(conversation, btn)
          }))
        }
      }
    };
  }

  if (config?.quickReplies) {
    const quickReplies = config?.quickReplies || [];

    return {
      text: 'dsadas',
      quick_replies: quickReplies.map(quickReply => ({
        content_type: 'text',
        title: quickReply.label,
        payload: generatePayloadString(conversation, quickReplies)
      }))
    };
  }

  if (config?.text) {
    return {
      text: config.text
    };
  }
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
  const { recipientId, senderId } = conversation;

  try {
    const message = generateMessage(config, conversation);

    console.log({ message });

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
          // integrationId: integration.erxesApiId,
          conversationId: conversation._id,
          content: `<p>${config.text}</p>`,
          internal: false,
          mid: resp.message_id
        },
        config.fromUserId
      );

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
