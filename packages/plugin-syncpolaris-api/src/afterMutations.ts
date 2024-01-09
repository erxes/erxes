import { companyToPolaris, customerToPolaris } from './utils/customerToPolaris';
import { generateModels } from './connectionResolver';

const allowTypes = {
  'contacts:customer': ['create', 'update'],
  'contacts:company': ['create', 'update'],
  //deposit
  'saving:deposit': ['create', 'update'],
  'saving:depositTransaction': ['create'],
  //saving
  'saving:contract': ['create'],
  //loan
  'loans:contract': ['create']
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
    if (type === 'contacts:customer') {
      syncLog = await models.SyncLogs.syncLogsAdd(syncLogDoc);
      if (action === 'create') {
        customerToPolaris(subdomain, params, 'create');
        return;
      }

      if (action === 'update') {
        customerToPolaris(subdomain, params, 'update');
        return;
      }
    }

    if (type === 'contacts:company') {
      syncLog = await models.SyncLogs.syncLogsAdd(syncLogDoc);
      if (action === 'create') {
        companyToPolaris(subdomain, params, 'create');
        return;
      }

      if (action === 'update') {
        companyToPolaris(subdomain, params, 'update');
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
