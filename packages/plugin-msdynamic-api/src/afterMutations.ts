import { generateModels } from './connectionResolver';
import { customerToDynamic, dealToDynamic } from './utils';

const allowTypes = {
  'contacts:customer': ['create'],
  'contacts:company': ['create'],
  'pos:order': ['synced'],
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
    consumeStr: JSON.stringify(params),
  };

  let syncLog;

  if (!Object.keys(allowTypes).includes(type)) {
    return;
  }

  if (!allowTypes[type].includes(action)) {
    return;
  }

  try {
    if (type === 'contacts:customer') {
      syncLog = await models.SyncLogs.syncLogsAdd(syncLogDoc);

      if (action === 'create') {
        customerToDynamic(subdomain, syncLog, params.object, models);
        return;
      }
    }

    if (type === 'contacts:company') {
      syncLog = await models.SyncLogs.syncLogsAdd(syncLogDoc);

      if (action === 'create') {
        customerToDynamic(subdomain, syncLog, params.object, models);
        return;
      }
    }

    if (type === 'pos:order') {
      syncLog = await models.SyncLogs.syncLogsAdd(syncLogDoc);

      if (action === 'synced') {
        dealToDynamic(subdomain, syncLog, params.object, models);
        return;
      }
    }
  } catch (e) {
    await models.SyncLogs.updateOne(
      { _id: syncLog._id },
      { $set: { error: e.message } },
    );
  }
};

export default allowTypes;
