import { sendRPCMessage } from './messageBrokerErkhet';
import { getPostData, getMoveData } from './utils/ebarimtData';
import {
  productToErkhet,
  productCategoryToErkhet
} from './utils/productToErkhet';
import { getConfig, sendCardInfo } from './utils/utils';
import { customerToErkhet, companyToErkhet } from './utils/customerToErkhet';
import { generateModels } from './connectionResolver';

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

  const syncLogDoc = {
    type: '',
    contentType: type,
    contentId: params.object._id,
    createdAt: new Date(),
    createdBy: user._id,
    consumeData: params,
    consumeStr: JSON.stringify(params)
  };

  if (!Object.keys(allowTypes).includes(type)) {
    return;
  }

  if (!allowTypes[type].includes(action)) {
    return;
  }

  let syncLog;

  try {
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
          syncLog = await models.SyncLogs.syncLogsAdd(syncLogDoc);
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
          syncLog = await models.SyncLogs.syncLogsAdd(syncLogDoc);
          const moveConfig = {
            ...moveConfigs[destinationStageId],
            ...(await getConfig(subdomain, 'ERKHET', {}))
          };

          const postData = await getMoveData(subdomain, moveConfig, deal);

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
            if (moveConfig.responseField) {
              await sendCardInfo(subdomain, deal, moveConfig, txt);
            } else {
              console.log(txt);
            }
          }

          return;
        }

        // create sale
        if (Object.keys(configs).includes(destinationStageId)) {
          syncLog = await models.SyncLogs.syncLogsAdd(syncLogDoc);
          const config = {
            ...configs[destinationStageId],
            ...(await getConfig(subdomain, 'ERKHET', {}))
          };
          const postData = await getPostData(subdomain, config, deal);

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
      return;
    }

    if (type === 'products:product') {
      syncLog = await models.SyncLogs.syncLogsAdd(syncLogDoc);
      if (action === 'create') {
        productToErkhet(subdomain, models, syncLog, params, 'create');
        return;
      }
      {
        if (action === 'update') {
          productToErkhet(subdomain, models, syncLog, params, 'update');
          return;
        }
      }
      {
        if (action === 'delete') {
          productToErkhet(subdomain, models, syncLog, params, 'delete');
          return;
        }
      }
      return;
    }
    if (type === 'products:productCategory') {
      syncLog = await models.SyncLogs.syncLogsAdd(syncLogDoc);
      if (action === 'create') {
        productCategoryToErkhet(
          subdomain,
          models,
          syncLog,
          params,
          'createCategory'
        );
        return;
      }

      if (action === 'update') {
        productCategoryToErkhet(
          subdomain,
          models,
          syncLog,
          params,
          'updateCategory'
        );
        return;
      }

      if (action === 'delete') {
        productCategoryToErkhet(
          subdomain,
          models,
          syncLog,
          params,
          'deleteCategory'
        );
        return;
      }
    }

    if (type === 'contacts:customer') {
      syncLog = await models.SyncLogs.syncLogsAdd(syncLogDoc);
      if (action === 'create') {
        customerToErkhet(subdomain, models, syncLog, params, 'create');
        return;
      }

      if (action === 'update') {
        customerToErkhet(subdomain, models, syncLog, params, 'update');
        return;
      }

      if (action === 'delete') {
        customerToErkhet(subdomain, models, syncLog, params, 'delete');
        return;
      }
    }

    if (type === 'contacts:company') {
      syncLog = await models.SyncLogs.syncLogsAdd(syncLogDoc);
      if (action === 'create') {
        companyToErkhet(subdomain, models, syncLog, params, 'create', user);
        return;
      }

      if (action === 'update') {
        companyToErkhet(subdomain, models, syncLog, params, 'update', user);
        return;
      }

      if (action === 'delete') {
        companyToErkhet(subdomain, models, syncLog, params, 'delete', user);
        return;
      }
    }
  } catch (e) {
    await models.SyncLogs.updateOne(
      { _id: syncLog._id },
      { $set: { error: e.message } }
    );
  }
};

export default allowTypes;
