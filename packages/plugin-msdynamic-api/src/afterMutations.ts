import { generateModels } from './connectionResolver';
import { customerToDynamic } from './utilsCustomer';
import { dealToDynamic, getConfig, orderToDynamic } from './utils';

const allowTypes = {
  'core:customer': ['create'],
  'core:company': ['create'],
  'pos:order': ['synced'],
  'sales:deal': ['update'],
};

export const afterMutationHandlers = async (subdomain, params) => {
  const { type, action, user } = params;

  if (!Object.keys(allowTypes).includes(type)) {
    return;
  }

  if (!allowTypes[type].includes(action)) {
    return;
  }

  let configs;

  try {
    configs = await getConfig(subdomain, 'DYNAMIC', {});
    if (!configs || !Object.keys(configs).length) {
      return;
    }
  } catch (e) {
    return;
  }

  const models = await generateModels(subdomain);

  const syncLogDoc = {
    type: '',
    contentType: type,
    contentId: params.object?._id,
    createdAt: new Date(),
    createdBy: user?._id,
    consumeData: params,
    consumeStr: JSON.stringify(params),
  };

  let syncLog;

  try {
    if (type === 'core:customer' && action === 'create') {
      syncLog = await models.SyncLogs.syncLogsAdd(syncLogDoc);

      await customerToDynamic(
        subdomain,
        syncLog,
        params.updatedDocument || params.object,
        'customer',
        models,
        configs
      );
      return;
    }

    if (type === 'core:company' && action === 'create') {
      syncLog = await models.SyncLogs.syncLogsAdd(syncLogDoc);

      await customerToDynamic(
        subdomain,
        syncLog,
        params.updatedDocument || params.object,
        'company',
        models,
        configs
      );
      return;
    }

    if (type === 'sales:deal' && action === 'update') {
      const deal = params.updatedDocument || params.object;
      const oldDeal = params.object;
      const destinationStageId = deal.stageId || '';

      if (!(destinationStageId && destinationStageId !== oldDeal.stageId)) {
        return;
      }

      const configsArray = Object.values(configs) as any[];

      const foundConfig = configsArray.find(
        (config) => config.useBoard && config.stageId === destinationStageId
      );

      if (foundConfig) {
        syncLog = await models.SyncLogs.syncLogsAdd(syncLogDoc);

        await dealToDynamic(subdomain, models, syncLog, deal, foundConfig);
      }
      return;
    }

    if (type === 'pos:order' && action === 'synced') {
      syncLog = await models.SyncLogs.syncLogsAdd(syncLogDoc);

      const updatedDoc = params.updatedDocument || params.object;
      const brandId = updatedDoc?.scopeBrandIds?.[0];
      const config = configs[brandId || 'noBrand'];

      if (!config.useBoard) {
        await orderToDynamic(subdomain, models, syncLog, updatedDoc, config);
      }
      return;
    }
  } catch (e) {
    await models.SyncLogs.updateOne(
      { _id: syncLog._id },
      { $set: { error: e.message } }
    );
  }
};

export default allowTypes;
