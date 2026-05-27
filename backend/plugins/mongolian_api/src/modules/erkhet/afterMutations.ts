import { sendTRPCMessage } from 'erxes-api-shared/utils';
import { generateModels } from '~/connectionResolvers';
import {
  companyToErkhet,
  customerToErkhet,
  getConfig,
  getConfigPostData,
  getIncomeData,
  getMoveData,
  productCategoryToErkhet,
  productToErkhet,
  sendCardInfo,
  sendErkhetPost,
  userToErkhet,
} from './utils';

const allowTypes = {
  'core:user': ['create', 'update'],
  'sales:deal': ['create', 'update'],
  'purchases:purchase': ['update'],
  'core:productCategory': ['create', 'update', 'delete'],
  'core:product': ['create', 'update', 'delete'],
  'core:customer': ['create', 'update', 'delete'],
  'core:company': ['create', 'update', 'delete'],
};

export const hasErkhetStageConfig = async (models, stageId?: string) => {
  if (!stageId) {
    return false;
  }

  const mainConfig = await models.Configs.getConfigValue('ERKHET', '');

  if (!mainConfig?.apiKey || !mainConfig?.apiSecret || !mainConfig?.apiToken) {
    return false;
  }

  const configs = await Promise.all([
    models.Configs.getConfig('ebarimtConfig', stageId),
    models.Configs.getConfig('returnEbarimtConfig', stageId),
    models.Configs.getConfig('stageInMoveConfig', stageId),
  ]);

  return configs.some(Boolean);
};

export const afterMutationHandlers = async (subdomain, params) => {
  const { type, action, user } = params;

  const models = await generateModels(subdomain);
  const content = params.object || params.updatedDocument || {};
  const userId = user?._id || user || params.userId;

  const syncLogDoc = {
    type: '',
    contentType: type,
    contentId: content._id,
    createdAt: new Date(),
    createdBy: userId,
    consumeData: params,
    consumeStr: JSON.stringify(params),
  };

  if (!Object.keys(allowTypes).includes(type)) {
    return;
  }

  if (!allowTypes[type].includes(action)) {
    return;
  }

  let syncLog;

  try {
    if (type === 'sales:deal') {
      if (action === 'update') {
        const deal = params.updatedDocument;
        const oldDeal = params.object || {};
        const destinationStageId = deal?.stageId || '';

        if (
          !(
            destinationStageId &&
            oldDeal?.stageId &&
            destinationStageId !== oldDeal.stageId
          )
        ) {
          return;
        }

        const mainConfig = await getConfig(subdomain, 'ERKHET', {});
        if (
          !mainConfig?.apiKey ||
          !mainConfig?.apiSecret ||
          !mainConfig?.apiToken
        ) {
          return;
        }

        const configs = await getConfig(subdomain, 'ebarimtConfig', {});
        const moveConfigs = await getConfig(subdomain, 'stageInMoveConfig', {});
        const returnConfigs = await getConfig(
          subdomain,
          'returnEbarimtConfig',
          {},
        );

        // return
        if (Object.keys(returnConfigs).includes(destinationStageId)) {
          syncLog = await models.SyncLogs.syncLogsAdd(syncLogDoc);
          const returnConfig = {
            ...mainConfig,
            ...returnConfigs[destinationStageId],
          };

          const orderInfos = [
            {
              orderId: deal._id,
              returnKind: returnConfig.returnType || 'note',
              date: ['sale', 'full'].includes(returnConfig.returnType || '')
                ? new Date().toISOString().slice(0, 10)
                : undefined,
              defaultPay: ['sale', 'full'].includes(
                returnConfig.returnType || '',
              )
                ? returnConfig.defaultPay
                : 'debtAmount',
            },
          ];

          const postData = {
            userEmail: returnConfig.userEmail,
            token: returnConfig.apiToken,
            apiKey: returnConfig.apiKey,
            apiSecret: returnConfig.apiSecret,
            orderInfos: JSON.stringify(orderInfos),
          };

          await sendErkhetPost(
            models,
            syncLog,
            'get-response-return-order',
            postData,
          );

          return;
        }

        // move
        if (Object.keys(moveConfigs).includes(destinationStageId)) {
          syncLog = await models.SyncLogs.syncLogsAdd(syncLogDoc);
          const moveConfig = {
            ...mainConfig,
            ...moveConfigs[destinationStageId],
          };

          const postData = await getMoveData(subdomain, moveConfig, deal);

          const response = await sendErkhetPost(
            models,
            syncLog,
            'get-response-inv-movement-info',
            postData,
          );
          if (response.message || response.error) {
            const txt = JSON.stringify({
              message: response.message,
              error: response.error,
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
            ...mainConfig,
            ...configs[destinationStageId],
          };

          const pipeline = await sendTRPCMessage({
            subdomain,
            pluginName: 'sales',
            method: 'query',
            module: 'pipeline',
            action: 'findOne',
            input: { stageId: destinationStageId, fields: { paymentTypes: 1 } },
            defaultValue: {},
          });

          const postData = await getConfigPostData(
            subdomain,
            config,
            deal,
            pipeline.paymentTypes,
          );

          const response = await sendErkhetPost(
            models,
            syncLog,
            'get-response-send-order-info',
            postData,
          );
          if (response && (response.message || response.error)) {
            const txt = JSON.stringify({
              message: response.message,
              error: response.error,
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

      if (action === 'create') {
        const deal = params.object;
        if (!deal?.productsData?.filter((pd) => pd.tickUsed).length) {
          return;
        }

        const destinationStageId = deal.stageId || '';
        if (!destinationStageId) {
          return;
        }

        const mainConfig = await getConfig(subdomain, 'ERKHET', {});
        if (
          !mainConfig?.apiKey ||
          !mainConfig?.apiSecret ||
          !mainConfig?.apiToken
        ) {
          return;
        }

        const configs = await getConfig(subdomain, 'ebarimtConfig', {});

        if (Object.keys(configs).includes(destinationStageId)) {
          syncLog = await models.SyncLogs.syncLogsAdd(syncLogDoc);
          const config = {
            ...mainConfig,
            ...configs[destinationStageId],
          };

          const cpipeline = await sendTRPCMessage({
            subdomain,
            pluginName: 'sales',
            module: 'pipeline',
            action: 'findOne',
            input: { stageId: destinationStageId, fields: { paymentTypes: 1 } },
            defaultValue: {},
          });

          const postData = await getConfigPostData(
            subdomain,
            config,
            deal,
            cpipeline.paymentTypes,
          );

          const cresponse = await sendErkhetPost(
            models,
            syncLog,
            'get-response-send-order-info',
            postData,
          );
          if (cresponse && (cresponse.message || cresponse.error)) {
            const txt = JSON.stringify({
              message: cresponse.message,
              error: cresponse.error,
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

    if (type === 'purchases:purchase') {
      if (action === 'update') {
        const purchase = params.updatedDocument;
        const oldPurchase = params.object;
        const destinationStageId = purchase.stageId || '';

        if (
          !(destinationStageId && destinationStageId !== oldPurchase.stageId)
        ) {
          return;
        }

        const mainConfig = await getConfig(subdomain, 'ERKHET', {});
        if (
          !mainConfig?.apiKey ||
          !mainConfig?.apiSecret ||
          !mainConfig?.apiToken
        ) {
          return;
        }

        const incomeConfigs = await getConfig(
          subdomain,
          'stageInIncomeConfig',
          {},
        );

        // income
        if (Object.keys(incomeConfigs).includes(destinationStageId)) {
          syncLog = await models.SyncLogs.syncLogsAdd(syncLogDoc);
          const incomeConfig = {
            ...mainConfig,
            ...incomeConfigs[destinationStageId],
          };

          const postData = await getIncomeData(
            subdomain,
            incomeConfig,
            purchase,
          );

          const response = await sendErkhetPost(
            models,
            syncLog,
            'get-response-inv-income-info',
            postData,
          );
          if (response.message || response.error) {
            const txt = JSON.stringify({
              message: response.message,
              error: response.error,
            });
            if (incomeConfig.responseField) {
              await sendCardInfo(subdomain, purchase, incomeConfig, txt);
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

    if (type === 'core:product') {
      const mainConfig = await getConfig(subdomain, 'ERKHET', {});
      if (
        !mainConfig?.apiKey ||
        !mainConfig?.apiSecret ||
        !mainConfig?.apiToken
      ) {
        return;
      }

      syncLog = await models.SyncLogs.syncLogsAdd(syncLogDoc);
      if (action === 'create') {
        await productToErkhet(
          subdomain,
          models,
          mainConfig,
          syncLog,
          params,
          'create',
        );
        return;
      }
      if (action === 'update') {
        await productToErkhet(
          subdomain,
          models,
          mainConfig,
          syncLog,
          params,
          'update',
        );
        return;
      }
      if (action === 'delete') {
        await productToErkhet(
          subdomain,
          models,
          mainConfig,
          syncLog,
          params,
          'delete',
        );
        return;
      }
      return;
    }

    if (type === 'core:productCategory') {
      const mainConfig = await getConfig(subdomain, 'ERKHET', {});
      if (
        !mainConfig?.apiKey ||
        !mainConfig?.apiSecret ||
        !mainConfig?.apiToken
      ) {
        return;
      }

      syncLog = await models.SyncLogs.syncLogsAdd(syncLogDoc);
      if (action === 'create') {
        await productCategoryToErkhet(
          subdomain,
          models,
          mainConfig,
          syncLog,
          params,
          'createCategory',
        );
        return;
      }

      if (action === 'update') {
        await productCategoryToErkhet(
          subdomain,
          models,
          mainConfig,
          syncLog,
          params,
          'updateCategory',
        );
        return;
      }

      if (action === 'delete') {
        await productCategoryToErkhet(
          subdomain,
          models,
          mainConfig,
          syncLog,
          params,
          'deleteCategory',
        );
        return;
      }
    }

    if (type === 'core:customer') {
      const mainConfig = await getConfig(subdomain, 'ERKHET', {});
      if (
        !mainConfig?.apiKey ||
        !mainConfig?.apiSecret ||
        !mainConfig?.apiToken
      ) {
        return;
      }

      syncLog = await models.SyncLogs.syncLogsAdd(syncLogDoc);
      if (action === 'create') {
        await customerToErkhet(models, mainConfig, syncLog, params, 'create');
        return;
      }

      if (action === 'update') {
        await customerToErkhet(models, mainConfig, syncLog, params, 'update');
        return;
      }

      if (action === 'delete') {
        await customerToErkhet(models, mainConfig, syncLog, params, 'delete');
        return;
      }
    }

    if (type === 'core:company') {
      const mainConfig = await getConfig(subdomain, 'ERKHET', {});
      if (
        !mainConfig?.apiKey ||
        !mainConfig?.apiSecret ||
        !mainConfig?.apiToken
      ) {
        return;
      }
      syncLog = await models.SyncLogs.syncLogsAdd(syncLogDoc);
      if (action === 'create') {
        await companyToErkhet(models, mainConfig, syncLog, params, 'create');
        return;
      }

      if (action === 'update') {
        await companyToErkhet(models, mainConfig, syncLog, params, 'update');
        return;
      }

      if (action === 'delete') {
        await companyToErkhet(models, mainConfig, syncLog, params, 'delete');
        return;
      }
    }

    if (type === 'core:user') {
      const mainConfig = await getConfig(subdomain, 'ERKHET', {});
      if (
        !mainConfig?.apiKey ||
        !mainConfig?.apiSecret ||
        !mainConfig?.apiToken
      ) {
        return;
      }

      if (action === 'create' || action === 'update') {
        const user = params.updatedDocument || params.object;
        const oldUser = params.object;

        if (!user.email) {
          return;
        }

        if (user.email === oldUser.email) {
          return;
        }

        syncLog = await models.SyncLogs.syncLogsAdd(syncLogDoc);
        await userToErkhet(models, mainConfig, syncLog, params, 'create');
        return;
      }
    }
  } catch (e) {
    if (syncLog?._id) {
      await models.SyncLogs.updateOne(
        { _id: syncLog._id },
        { $set: { error: e.message } },
      );
    }

    throw e;
  }
};

export default allowTypes;
