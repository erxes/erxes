import { generateModels } from '../connectionResolver';
import { actionCreateComment, checkCommentTrigger } from './comments';
import { actionCreateMessage, checkMessageTrigger } from './messages';

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
        icon: 'messenger',
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
      {
        type: 'facebook:comments',
        img: 'automation4.svg',
        icon: 'comments',
        label: 'Facebook Comments',
        description:
          'Start with a blank workflow that enralls and is triggered off facebook comments',
        isCustom: true,
      },
    ],
  },
  receiveActions: async ({
    subdomain,
    data: { action, execution, actionType, collectionType },
  }) => {
    const models = await generateModels(subdomain);

    if (actionType === 'create') {
      switch (collectionType) {
        case 'messages':
          return await actionCreateMessage(
            models,
            subdomain,
            action,
            execution,
          );
        case 'comments':
          return await actionCreateComment(
            models,
            subdomain,
            action,
            execution,
          );

        default:
          return;
      }
    }

    return;
  },
  checkCustomTrigger: async ({ subdomain, data }) => {
    const { collectionType } = data;

    switch (collectionType) {
      case 'messages':
        return checkMessageTrigger(subdomain, data);
      case 'comments':
        return checkCommentTrigger(subdomain, data);
      default:
        return false;
    }
  },
};
