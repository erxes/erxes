import { sendCommonMessage, sendRPCMessage } from './messageBrokerErkhet';
import { getPostData } from './utils/ebarimtData';
import {
  productToErkhet,
  productCategoryToErkhet
} from './utils/productToErkhet';
import { getConfig } from './utils/utils';
import { customerToErkhet, companyToErkhet } from './utils/customerToErkhet';
import { graphqlPubsub } from './configs';

export default {
  'cards:deal': ['update'],
  'products:productCategory': ['create', 'update', 'delete'],
  'products:product': ['create', 'update', 'delete'],
  'contacts:customer': ['create', 'update', 'delete'],
  'contacts:company': ['create', 'update', 'delete']
};

export const afterMutationHandlers = async (subdomain, params) => {
  const { type, action, user } = params;

  if (type === 'cards:deal') {
    if (action === 'update') {
      const deal = params.updatedDocument;
      const oldDeal = params.object;
      const destinationStageId = deal.stageId || '';

      if (!(destinationStageId && destinationStageId !== oldDeal.stageId)) {
        return;
      }

      const configs = await getConfig(subdomain, 'ebarimtConfig', {});
      const returnConfigs = await getConfig(
        subdomain,
        'returnEbarimtConfig',
        {}
      );

      if (Object.keys(returnConfigs).includes(destinationStageId)) {
        const returnConfig = {
          ...returnConfigs[destinationStageId],
          ...(await getConfig(subdomain, 'ERKHET', {}))
        };

        const orderInfos = [
          {
            orderId: deal._id,
            returnKind: 'note'
          }
        ];

        const postData = {
          userEmail: returnConfig.userEmail,
          token: returnConfig.apiToken,
          apiKey: returnConfig.apiKey,
          apiSecret: returnConfig.apiSecret,
          orderInfos: JSON.stringify(orderInfos)
        };

        await sendCommonMessage('rpc_queue:erxes-automation-erkhet', {
          action: 'get-response-return-order',
          isJson: true,
          isEbarimt: returnConfig.isEbarimt || false,
          payload: JSON.stringify(postData),
          thirdService: true
        });

        return;
      }

      if (!Object.keys(configs).includes(destinationStageId)) {
        return;
      }

      const config = {
        ...configs[destinationStageId],
        ...(await getConfig(subdomain, 'ERKHET', {}))
      };
      const postData = await getPostData(subdomain, config, deal);

      const isEbarimt = config.isEbarimt || false;
      if (isEbarimt) {
        const apiAutomationResponse = await sendRPCMessage(
          'rpc_queue:erxes-automation-erkhet',
          {
            action: 'get-response-send-order-info',
            isEbarimt: isEbarimt,
            payload: JSON.stringify(postData),
            thirdService: true
          }
        );

        if (!apiAutomationResponse) {
          return;
        }
        try {
          await graphqlPubsub.publish('automationResponded', {
            automationResponded: {
              userId: user._id,
              responseId: deal._id,
              sessionCode: user.sessionCode || '',
              content: { ...config, ...apiAutomationResponse }
            }
          });
        } catch (e) {
          throw new Error(e.message);
        }
      } else {
        await sendCommonMessage('rpc_queue:erxes-automation-erkhet', {
          action: 'get-response-send-order-info',
          isEbarimt: isEbarimt,
          payload: JSON.stringify(postData),
          thirdService: true
        });
      }
      return;
    }
    return;
  }
  if (type === 'products:product') {
    if (action === 'create') {
      productToErkhet(subdomain, params, 'create');
      return;
    }
    {
      if (action === 'update') {
        productToErkhet(subdomain, params, 'update');
        return;
      }
    }
    {
      if (action === 'delete') {
        productToErkhet(subdomain, params, 'delete');
        return;
      }
    }
    return;
  }
  if (type === 'products:productCategory') {
    if (action === 'create') {
      productCategoryToErkhet(subdomain, params, 'createCategory');
      return;
    }

    if (action === 'update') {
      productCategoryToErkhet(subdomain, params, 'updateCategory');
      return;
    }

    if (action === 'delete') {
      productCategoryToErkhet(subdomain, params, 'deleteCategory');
      return;
    }
  }

  if (type === 'contacts:customer') {
    if (action === 'create') {
      customerToErkhet(subdomain, params, 'create');
      return;
    }

    if (action === 'update') {
      customerToErkhet(subdomain, params, 'update');
      return;
    }

    if (action === 'delete') {
      customerToErkhet(subdomain, params, 'delete');
      return;
    }
  }

  if (type === 'contacts:company') {
    if (action === 'create') {
      companyToErkhet(subdomain, params, 'create', user);
      return;
    }

    if (action === 'update') {
      companyToErkhet(subdomain, params, 'update', user);
      return;
    }

    if (action === 'delete') {
      companyToErkhet(subdomain, params, 'delete', user);
      return;
    }
  }
};
