import { generateModels } from './connectionResolver';
import { customerToDynamic } from './utils';

const allowTypes = {
  'contacts:customer': ['create'],
  'contacts:company': ['create']
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

  // let syncLog;

  try {
    if (type === 'contacts:customer') {
      // syncLog = await models.SyncLogs.syncLogsAdd(syncLogDoc);
      if (action === 'create') {
        customerToDynamic(subdomain, params);
        return;
      }
    }

    if (type === 'contacts:company') {
      // syncLog = await models.SyncLogs.syncLogsAdd(syncLogDoc);
      if (action === 'create') {
        customerToDynamic(subdomain, params);
        return;
      }
    }
  } catch (e) {
    console.log(e, 'error');
    // await models.SyncLogs.updateOne(
    //   { _id: syncLog._id },
    //   { $set: { error: e.message } }
    // );
  }
};

export default allowTypes;
