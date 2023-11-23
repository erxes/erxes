import { sendRPCMessage } from './messageBrokerErkhet';
import { getPostData, getMoveData } from './utils/ebarimtData';
import {
  productToErkhet,
  productCategoryToErkhet
} from './utils/productToErkhet';
import { customerToErkhet, companyToErkhet } from './utils/customerToErkhet';
import { generateModels } from './connectionResolver';
import { getSyncLogDoc } from './utils/utils';

const allowTypes = {
  'cards:deal': ['update'],
  'products:productCategory': ['create', 'update', 'delete'],
  'products:product': ['create', 'update', 'delete'],
  'contacts:customer': ['create', 'update', 'delete'],
  'contacts:company': ['create', 'update', 'delete']
};

export const afterMutationHandlers = async (subdomain, params) => {
  const { type, action, user } = params;

  const models = await generateModels(subdomain);

  if (!Object.keys(allowTypes).includes(type)) {
    return;
  }

  if (!allowTypes[type].includes(action)) {
    return;
  }

  if (type === 'cards:deal') {
    if (action === 'update') {
      const deal = params.updatedDocument;
      const oldDeal = params.object;
      const destinationStageId = deal.stageId || '';

      if (!(destinationStageId && destinationStageId !== oldDeal.stageId)) {
        return;
      }

      const saleConfigs = await models.Configs.getConfig(
        'stageInSaleConfig',
        {}
      );

      const moveConfigs = await models.Configs.getConfig(
        'stageInMoveConfig',
        {}
      );
      const returnConfigs = await models.Configs.getConfig(
        'returnEbarimtConfig',
        {}
      );

      const mainConfigs = await models.Configs.getConfig('erkhetConfig', {});

      // return
      if (Object.keys(returnConfigs).includes(destinationStageId)) {
        const returnConfig = {
          ...returnConfigs[destinationStageId],
          ...(await models.Configs.getConfig('ERKHET', {}))
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
        const syncLog = await models.SyncLogs.syncLogsAdd(
          getSyncLogDoc(params)
        );
        await sendRPCMessage(
          models,
          syncLog,
          'rpc_queue:erxes-automation-erkhet',
          {
            action: 'get-response-return-order',
            isJson: true,
            isEbarimt: false,
            payload: JSON.stringify(postData),
            thirdService: true
          }
        );

        return;
      }

      // move
      if (Object.keys(moveConfigs).includes(destinationStageId)) {
        const moveConfig = {
          ...moveConfigs[destinationStageId],
          ...(await models.Configs.getConfig('ERKHET', {}))
        };

        const postData = await getMoveData(subdomain, moveConfig, deal);
        const syncLog = await models.SyncLogs.syncLogsAdd(
          getSyncLogDoc(params)
        );
        const response = await sendRPCMessage(
          models,
          syncLog,
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
          console.log(txt);
        }

        return;
      }

      // create sale
      if (Object.keys(saleConfigs).includes(destinationStageId)) {
        const brandRules = saleConfigs[destinationStageId].brandRules || {};

        const brandIds = Object.keys(brandRules).filter(b =>
          Object.keys(mainConfigs).includes(b)
        );

        const configs = {};
        for (const brandId of brandIds) {
          configs[brandId] = {
            ...mainConfigs[brandId],
            ...brandRules[brandId],
            hasPayment: saleConfigs[destinationStageId].hasPayment
          };
        }

        const postDatas = (await getPostData(
          subdomain,
          models,
          user,
          configs,
          deal
        )) as any;

        for (const data of postDatas) {
          const { syncLog, postData } = data;
          const response = await sendRPCMessage(
            models,
            syncLog,
            'rpc_queue:erxes-automation-erkhet',
            {
              action: 'get-response-send-order-info',
              isEbarimt: false,
              payload: JSON.stringify(postData),
              isJson: true,
              thirdService: true
            }
          );

          if (response && (response.message || response.error)) {
            const txt = JSON.stringify({
              message: response.message,
              error: response.error
            });
            console.log(txt);
          }
        }
        return;
      }
      return;
    }
    return;
  }

  if (type === 'products:product') {
    if (action === 'create') {
      productToErkhet(subdomain, models, params, 'create');
      return;
    }
    if (action === 'update') {
      productToErkhet(subdomain, models, params, 'update');
      return;
    }
    if (action === 'delete') {
      productToErkhet(subdomain, models, params, 'delete');
      return;
    }
    return;
  }
  if (type === 'products:productCategory') {
    if (action === 'create') {
      productCategoryToErkhet(subdomain, models, params, 'createCategory');
      return;
    }

    if (action === 'update') {
      productCategoryToErkhet(subdomain, models, params, 'updateCategory');
      return;
    }

    if (action === 'delete') {
      productCategoryToErkhet(subdomain, models, params, 'deleteCategory');
      return;
    }
  }

  if (type === 'contacts:customer') {
    if (action === 'create') {
      customerToErkhet(models, params, 'create');
      return;
    }

    if (action === 'update') {
      customerToErkhet(models, params, 'update');
      return;
    }

    if (action === 'delete') {
      customerToErkhet(models, params, 'delete');
      return;
    }
  }

  if (type === 'contacts:company') {
    if (action === 'create') {
      companyToErkhet(models, params, 'create');
      return;
    }

    if (action === 'update') {
      companyToErkhet(models, params, 'update');
      return;
    }

    if (action === 'delete') {
      companyToErkhet(models, params, 'delete');
      return;
    }
  }
};

export default allowTypes;
