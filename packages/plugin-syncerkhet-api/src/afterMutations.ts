import { sendCommonMessage, sendRPCMessage } from './messageBrokerErkhet';
import { getPostData, getMoveData } from './utils/ebarimtData';
import {
  productToErkhet,
  productCategoryToErkhet
} from './utils/productToErkhet';
import { getConfig, sendCardInfo } from './utils/utils';
import { customerToErkhet, companyToErkhet } from './utils/customerToErkhet';

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
      const moveConfigs = await getConfig(subdomain, 'stageInMoveConfig', {});
      const returnConfigs = await getConfig(
        subdomain,
        'returnEbarimtConfig',
        {}
      );

      // return
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
          isEbarimt: false,
          payload: JSON.stringify(postData),
          thirdService: true
        });

        return;
      }

      // move
      if (Object.keys(moveConfigs).includes(destinationStageId)) {
        const moveConfig = {
          ...moveConfigs[destinationStageId],
          ...(await getConfig(subdomain, 'ERKHET', {}))
        };

        const postData = await getMoveData(subdomain, moveConfig, deal);

        const response = await sendRPCMessage(
          'rpc_queue:erxes-automation-erkhet',
          {
            action: 'get-response-inv-movement-info',
            isJson: true,
            isEbarimt: false,
            payload: JSON.stringify(postData),
            thirdService: true
          }
        );

        if (response.message || response.error) {
          const txt = JSON.stringify({
            message: response.message,
            error: response.error
          });
          if (moveConfig.responseField) {
            await sendCardInfo(subdomain, deal, moveConfig, txt);
          } else {
            console.log(txt);
          }
        }

        return;
      }

      // nothing
      if (!Object.keys(configs).includes(destinationStageId)) {
        return;
      }

      // create sale
      const config = {
        ...configs[destinationStageId],
        ...(await getConfig(subdomain, 'ERKHET', {}))
      };
      const postData = await getPostData(subdomain, config, deal);

      const response = await sendRPCMessage(
        'rpc_queue:erxes-automation-erkhet',
        {
          action: 'get-response-send-order-info',
          isEbarimt: false,
          payload: JSON.stringify(postData),
          isJson: true,
          thirdService: true
        }
      );

      if (response.message || response.error) {
        const txt = JSON.stringify({
          message: response.message,
          error: response.error
        });
        if (config.responseField) {
          await sendCardInfo(subdomain, deal, config, txt);
        } else {
          console.log(txt);
        }
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
