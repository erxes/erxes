import { generateModels } from '~/connectionResolvers';
import { customerToDynamic } from './utilsCustomer';
import { dealToDynamic, orderToDynamic } from './utils';

const allowTypes: Record<string, string[]> = {
  'core:customer': ['create'],
  'core:company': ['create'],
  'pos:order': ['synced'],
  'sales:deal': ['update'],
};

export const afterMutationHandlers = async (subdomain: string, params: any) => {
  const { type, action, user, object, updatedDocument } = params;

  if (!allowTypes[type]?.includes(action)) {
    return;
  }

  const models = await generateModels(subdomain);

  // ✅ NEW: Load configs from MNConfig system
  const dynamicConfigs = await models.Configs.getConfigs('DYNAMIC');

  if (!dynamicConfigs?.length) {
    return;
  }

  const configsMap = dynamicConfigs.reduce(
    (acc, conf) => {
      acc[conf.subId || 'noBrand'] = conf.value;
      return acc;
    },
    {} as Record<string, any>,
  );

  const contentId = updatedDocument?._id || object?._id;

  const syncLogDoc = {
    type: '',
    contentType: type,
    contentId,
    createdAt: new Date(),
    createdBy: user?._id,
    consumeData: params,
    consumeStr: JSON.stringify(params),
  };

  let syncLog: any;

  try {
    switch (type) {
      case 'core:customer':
      case 'core:company': {
        syncLog = await models.SyncLogs.syncLogsAdd(syncLogDoc);

        await customerToDynamic(
          subdomain,
          syncLog,
          updatedDocument || object,
          type === 'core:customer' ? 'customer' : 'company',
          models,
          configsMap,
        );

        break;
      }

      case 'sales:deal': {
        const deal = updatedDocument || object;
        const oldDeal = object;

        const destinationStageId = deal?.stageId;

        if (!destinationStageId || destinationStageId === oldDeal?.stageId) {
          return;
        }

        const foundConfig = Object.values(configsMap).find(
          (config: any) =>
            config?.useBoard && config?.stageId === destinationStageId,
        );

        if (!foundConfig) {
          return;
        }

        syncLog = await models.SyncLogs.syncLogsAdd(syncLogDoc);

        await dealToDynamic(subdomain, models, syncLog, deal, foundConfig);

        break;
      }

      case 'pos:order': {
        syncLog = await models.SyncLogs.syncLogsAdd(syncLogDoc);

        const updatedDoc = updatedDocument || object;
        const brandId = updatedDoc?.scopeBrandIds?.[0];

        const config = configsMap[brandId || 'noBrand'];

        if (config && !config.useBoard) {
          await orderToDynamic(subdomain, models, syncLog, updatedDoc, config);
        }

        break;
      }

      default:
        break;
    }
  } catch (e: any) {
    if (syncLog?._id) {
      await models.SyncLogs.updateOne(
        { _id: syncLog._id },
        { $set: { error: e?.message || 'Unknown error' } },
      );
    }
  }
};

export default allowTypes;
