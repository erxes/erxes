import { companyToPolaris, customerToPolaris } from './utils/customerToPolaris';
import { generateModels } from './connectionResolver';
import { savingToPolaris } from './utils/savingToPolaris';
import { depositToPolaris } from './utils/depositToPolaris';
import { depositTransactionToPolaris } from './utils/depositTransactionToPolaris';
import { loansToPolaris } from './utils/loansToPolaris';
import { loanClassificationToPolaris } from './utils/loanClassificationToPolaris';
import { loanTransactionsToPolaris } from './utils/loanTransactionsToPolaris';

const allowTypes = {
  'contacts:customer': ['create', 'update'],
  'contacts:company': ['create', 'update'],
  //deposit
  'savings:deposit': ['create', 'update'],
  'savings:depositTransaction': ['create'],
  //saving
  'savings:contract': ['create'],
  //loan
  'loans:contract': ['create', 'update'],
  'loans:classification': ['create'],
  'loans:transaction': ['create'],
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

  if (!Object.keys(allowTypes).includes(type)) {
    return;
  }

  if (!allowTypes[type].includes(action)) {
    return;
  }

  let syncLog;

  try {
    switch (type) {
      case type === 'contacts:customer':
        {
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
        break;
      case type === 'contacts:company':
        {
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
        break;
      case type === 'savings:deposit':
        depositToPolaris(subdomain, params);
        break;
      case type === 'savings:depositTransaction':
        depositTransactionToPolaris(subdomain, params, action);
        break;
      case type === 'savings:contract':
        savingToPolaris(subdomain, params);
        break;
      case type === 'loans:contract':
        loansToPolaris(subdomain, params, action);
        break;
      case type === 'loans:classification':
        loanClassificationToPolaris(subdomain, params);
        break;
      case type === 'loans:transaction':
        loanTransactionsToPolaris(subdomain, params, action);
        break;
    }
  } catch (e) {
    await models.SyncLogs.updateOne(
      { _id: syncLog._id },
      { $set: { error: e.message } },
    );
  }
};

export default allowTypes;
