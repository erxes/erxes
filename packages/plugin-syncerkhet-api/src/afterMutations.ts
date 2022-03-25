import { sendRPCMessage } from './messageBroker';
import { getPostData } from './utils/ebarimtData';
import { productToErkhet, productCategoryToErkhet } from './utils/productToErkhet';
import { getConfig } from './utils/utils';
import { customerToErkhet, companyToErkhet } from './utils/customerToErkhet';


export default {
  'cards:deal': ['update'],
  'products:productCategory': ['create', 'update', 'delete'],
  'products:product': ['create', 'update', 'delete'],
  'contacts:customer': ['create', 'update', 'delete'],
  'contacts:company': ['create', 'update', 'delete'],
};

export const afterMutationHandlers = async (subdomain, params) => {
  const { type, action } = params;

  if (type === 'cards:deal') {
    if (action === 'update') {
      const deal = params.updatedDocument
      const oldDeal = params.object;
      const destinationStageId = deal.stageId || '';

      if (!(destinationStageId && destinationStageId !== oldDeal.stageId)) {
        return;
      }

      const configs = await getConfig(subdomain, 'ebarimtConfig', {});

      if (!Object.keys(configs).includes(destinationStageId)) {
        return;
      }

      const config = {
        ...configs[destinationStageId],
        ...await getConfig(subdomain, 'ERKHET', {})
      };
      const postData = await getPostData(subdomain, config, deal)

      const apiAutomationResponse = await sendRPCMessage('rpc_queue:erxes-automation-erkhet', {
        action: 'get-response-send-order-info',
        isEbarimt: config.isEbarimt,
        payload: JSON.stringify(postData),
      });

      if (!apiAutomationResponse) {
        return;
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
      companyToErkhet(subdomain, params, 'create');
      return;
    }

    if (action === 'update') {
      companyToErkhet(subdomain, params, 'update');
      return;
    }

    if (action === 'delete') {
      companyToErkhet(subdomain, params, 'delete');
      return;
    }
  }
}
