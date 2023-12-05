import { graphqlPubsub } from './configs';
import { sendRPCMessage } from './messageBrokerErkhet';
import { getPostData } from './utils/ebarimtData';
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

      const returnConfigs = await models.Configs.getConfig(
        'stageInReturnConfig',
        {}
      );

      const mainConfigs = await models.Configs.getConfig('erkhetConfig', {});

      // return
      if (Object.keys(returnConfigs).includes(destinationStageId)) {
        const returnConfig = returnConfigs[destinationStageId];

        const sameSaleStageId = (Object.keys(saleConfigs).filter(
          stageId => saleConfigs[stageId].pipelineId === returnConfig.pipelineId
        ) || [])[0];

        if (!sameSaleStageId) {
          return;
        }
        const brandRules = saleConfigs[sameSaleStageId].brandRules;

        const orderInfos = [
          {
            orderId: deal._id,
            returnKind: 'note'
          }
        ];

        const ebarimtResponses: any[] = [];
        for (const brandId of Object.keys(brandRules)) {
          const userEmail = brandRules[brandId].userEmail;
          if (!userEmail) {
            continue;
          }

          const mainConfig = mainConfigs[brandId] || {};
          if (
            !mainConfig.apiKey ||
            !mainConfig.apiSecret ||
            !mainConfig.apiToken
          ) {
            continue;
          }

          const postData = {
            userEmail,
            token: mainConfig.apiToken,
            apiKey: mainConfig.apiKey,
            apiSecret: mainConfig.apiSecret,
            orderInfos: JSON.stringify(orderInfos)
          };
          const syncLog = await models.SyncLogs.syncLogsAdd(
            getSyncLogDoc(params)
          );
          const resp = await sendRPCMessage(
            models,
            syncLog,
            'rpc_queue:erxes-automation-erkhet',
            {
              action: 'get-response-return-order',
              isJson: true,
              isEbarimt: true,
              payload: JSON.stringify(postData),
              thirdService: true
            }
          );

          ebarimtResponses.push(resp);
        }

        await graphqlPubsub.publish('automationResponded', {
          automationResponded: {
            userId: user._id,
            responseId: ebarimtResponses.map(er => er._id).join('-'),
            sessionCode: user.sessionCode || '',
            content: ebarimtResponses.map(er => ({
              ...er.ebarimt,
              _id: er._id,
              error: er.error,
              success: Boolean(er.message) ? 'false' : 'true',
              message:
                typeof er.message === 'string'
                  ? er.message
                  : er.message?.message || er.message?.error || ''
            }))
          }
        });
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

        const ebarimtResponses: any[] = [];

        for (const data of postDatas) {
          const { syncLog, postData } = data;
          const response = await sendRPCMessage(
            models,
            syncLog,
            'rpc_queue:erxes-automation-erkhet',
            {
              action: 'get-response-send-order-info',
              isEbarimt: true,
              payload: JSON.stringify(postData),
              isJson: true,
              thirdService: true
            }
          );

          ebarimtResponses.push({ ...response, _id: Math.random() });

          if (response && (response.message || response.error)) {
            const txt = JSON.stringify({
              message: response.message,
              error: response.error
            });
            console.log(txt);
          }
        }

        await graphqlPubsub.publish('automationResponded', {
          automationResponded: {
            userId: user._id,
            responseId: ebarimtResponses.map(er => er._id).join('-'),
            sessionCode: user.sessionCode || '',
            content: ebarimtResponses.map(er => ({
              ...er.ebarimt,
              _id: er._id,
              error: er.error,
              success: er.success,
              message:
                typeof er.message === 'string'
                  ? er.message
                  : er.message?.message || er.message?.error || ''
            }))
          }
        });
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
