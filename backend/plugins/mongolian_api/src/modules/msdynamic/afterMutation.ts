import { generateModels } from '~/connectionResolvers';
import { customerToDynamic } from './utilsCustomer';
import { dealToDynamic, getConfig, orderToDynamic } from './utils';

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

  const configsMap = await getConfig(subdomain, 'DYNAMIC', {});

  if (!configsMap || !Object.keys(configsMap).length) {
    return;
  }

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
        syncLog = await models.SyncLogsMSD.syncLogsAdd(syncLogDoc);
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
        const oldStageId = oldDeal?.stageId;

        if (!destinationStageId || destinationStageId === oldStageId) {
          return;
        }

        const foundConfig = Object.values(configsMap).find(
          (config: any) =>
            config?.useBoard && config?.stageId === destinationStageId,
        );

        if (!foundConfig) {
          return;
        }

        syncLog = await models.SyncLogsMSD.syncLogsAdd(syncLogDoc);

        await dealToDynamic(subdomain, models, syncLog, deal, foundConfig);

        break;
      }

      case 'pos:order': {
        syncLog = await models.SyncLogsMSD.syncLogsAdd(syncLogDoc);

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
    console.error('MSDynamic error:', e);

    if (syncLog?._id) {
      await models.SyncLogsMSD.updateOne(
        { _id: syncLog._id },
        {
          $set: {
            error: e?.message || 'Unknown error',
          },
        },
      );
    }
  }
};

export default allowTypes;
