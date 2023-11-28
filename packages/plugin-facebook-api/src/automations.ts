import { readFileUrl } from '@erxes/api-utils/src/commonUtils';
import { IModels, generateModels } from './connectionResolver';
import { sendReply } from './utils';
import { IConversation } from './models/definitions/conversations';

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
    data: { action, execution, actionType, collectionType, playWait }
  }) => {
    console.log('works', actionType, collectionType);
    const models = await generateModels(subdomain);

    if (actionType === 'create' && collectionType === 'messages') {
      return await actionCreateMessage(
        models,
        subdomain,
        action,
        execution,
        playWait
      );
    }

    return;
  }
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
              title: btn,
              payload: 'hi'
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
            title: btn,
            payload: 'hi'
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
        payload: JSON.stringify({
          btnId: quickReply._id,
          erxesApiId: conversation.erxesApiId,
          recipientId: conversation.recipientId
        })
      }))
    };
  }
};

const actionCreateMessage = async (
  models: IModels,
  subdomain,
  action,
  execution,
  setActionWait
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

    console.log({ message: JSON.stringify(message) });

    if (!message) {
      console.log('no message to generate message');
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
      setActionWait(subdomain, {
        execution,
        checkData: {},
        waitActionId: action._id
      });
      return await models.ConversationMessages.addMessage(
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
    }
  } catch (error) {
    console.log(error.message);
  }
};
