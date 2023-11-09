import { IModels, generateModels } from './connectionResolver';
import { handleFacebookMessage } from './handleFacebookMessage';

export default {
  constants: {
    actions: [
      {
        type: 'facebook:messages.create',
        icon: 'messenger',
        label: 'Send Facebook Message',
        description: 'Send Facebook Message',
        isAvailable: true
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

  const payload = {
    conversationId: conversation.erxesApiId,
    integrationId: integration.erxesApiId,
    content: `<p>${config.text}</p>`,
    internal: false,
    userId: config.fromUserId
  };

  return await handleFacebookMessage(models, {
    action: 'reply-messenger',
    type: 'facebook',
    payload: JSON.stringify(payload),
    integrationId: conversation.integrationId
  });
};
