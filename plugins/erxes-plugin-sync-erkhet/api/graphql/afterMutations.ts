import { getConfig } from 'erxes-api-utils'
import { companyToErkhet, customerToErkhet } from '../utils/customerToErkhet';
import { getPostData } from '../utils/ebarimtData';
import { productCategoryToErkhet, productToErkhet } from '../utils/productToErkhet';
export default [
  /**
   * Cars list
   */
  {
    type: 'deal',
    action: 'update',
    handler: async (_root, params, { models, memoryStorage, user, messageBroker, graphqlPubsub }) => {
      const deal = params.updatedDocument
      const oldDeal = params.object;
      const destinationStageId = deal.stageId || '';

      if (!(destinationStageId && destinationStageId !== oldDeal.stageId)) {
        return;
      }

      const configs = await getConfig(models, memoryStorage, 'ebarimtConfig', {});

      if (!Object.keys(configs).includes(destinationStageId)) {
        return;
      }

      const config = {
        ...configs[destinationStageId],
        ...await getConfig(models, memoryStorage, 'ERKHET', {})
      };
      const postData = await getPostData(models, config, deal)

      const apiAutomationResponse = await messageBroker().sendRPCMessage('rpc_queue:erxes-automation-erkhet', {
        action: 'get-response-send-order-info',
        isEbarimt: config.isEbarimt,
        payload: JSON.stringify(postData),
      });

      if (!apiAutomationResponse) {
        return;
      }

      try {
        const responseId = Math.random().toString();

        graphqlPubsub.publish('automationResponded', {
          automationResponded: {
            userId: user._id,
            responseId,
            sessionCode: user.sessionCode || '',
            content: apiAutomationResponse,
          },
        });
      } catch (e) {
        throw new Error(e.message);
      }
    }
  },
  {
    type: 'product-category',
    action: 'create',
    handler: async (_root, params, { models, memoryStorage, messageBroker }) => {
      productCategoryToErkhet(models, messageBroker, memoryStorage, params, 'createCategory')
    }
  },
  {
    type: 'product-category',
    action: 'update',
    handler: async (_root, params, { models, messageBroker, memoryStorage }) => {
      productCategoryToErkhet(models, messageBroker, memoryStorage, params, 'updateCategory')
    }
  },
  {
    type: 'product-category',
    action: 'delete',
    handler: async (_root, params, { models, messageBroker, memoryStorage }) => {
      productCategoryToErkhet(models, messageBroker, memoryStorage, params, 'deleteCategory')
    }
  },
  {
    type: 'product',
    action: 'create',
    handler: async (_root, params, { models, messageBroker, memoryStorage }) => {
      productToErkhet(models, messageBroker, memoryStorage, params, 'create')
    }
  },
  {
    type: 'product',
    action: 'update',
    handler: async (_root, params, { models, messageBroker, memoryStorage }) => {
      productToErkhet(models, messageBroker, memoryStorage, params, 'update')
    }
  },
  {
    type: 'product',
    action: 'delete',
    handler: async (_root, params, { models, messageBroker, memoryStorage }) => {
      productToErkhet(models, messageBroker, memoryStorage, params, 'delete')
    }
  },
  {
    type: 'customer',
    action: 'create',
    handler: async (_root, params, { models, messageBroker, memoryStorage }) => {
      customerToErkhet(models, messageBroker, memoryStorage, params, 'create')
    }
  },
  {
    type: 'customer',
    action: 'update',
    handler: async (_root, params, { models, messageBroker, memoryStorage }) => {
      customerToErkhet(models, messageBroker, memoryStorage, params, 'update')
    }
  },
  {
    type: 'customer',
    action: 'delete',
    handler: async (_root, params, { models, messageBroker, memoryStorage }) => {
      customerToErkhet(models, messageBroker, memoryStorage, params, 'delete')
    }
  },
  {
    type: 'company',
    action: 'create',
    handler: async (_root, params, { user, models, messageBroker, memoryStorage, graphqlPubsub }) => {
      companyToErkhet(user, models, messageBroker, memoryStorage, graphqlPubsub, params, 'create')
    }
  },
  {
    type: 'company',
    action: 'update',
    handler: async (_root, params, { user, models, messageBroker, memoryStorage, graphqlPubsub }) => {
      companyToErkhet(user, models, messageBroker, memoryStorage, graphqlPubsub, params, 'update')
    }
  },
  {
    type: 'company',
    action: 'delete',
    handler: async (_root, params, { user, models, messageBroker, memoryStorage, graphqlPubsub }) => {
      companyToErkhet(user, models, messageBroker, memoryStorage, graphqlPubsub, params, 'delete')
    }
  }
]
