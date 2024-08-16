import { generateModels } from './connectionResolver';
import { createCustomer } from './utils/customer/createCustomer';
import { updateCustomer } from './utils/customer/updateCustomer';
import { createDeposit } from './utils/deposit/createDeposit';
import { updateDeposit } from './utils/deposit/updateDeposit';
import { createChangeClassification } from './utils/loan/changeClassification';
import { createLoan } from './utils/loan/createLoan';
import { createLoanGive } from './utils/loan/loanGive';
import { createLoanRepayment } from './utils/loan/loanRepayment';
import { updateLoan } from './utils/loan/updateLoan';
import { createSaving } from './utils/saving/createSaving';
import { incomeSaving } from './utils/saving/incomeSaving';
import { outcomeSaving } from './utils/saving/outcomeSaving';
import { updateSaving } from './utils/saving/updateSaving';

const allowTypes = {
  'contacts:customer': ['create', 'update'],
  'contacts:company': ['create', 'update'],
  //deposit
  'savings:transaction': ['create'],
  //saving
  'savings:contract': ['create', 'update'],
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

  const preSuccessValue = await models.SyncLogs.findOne({
    contentType: type,
    contentId: params.object._id,
    error: { $exists: false },
    responseData: { $exists: true, $ne: null },
  }).sort({ createdAt: -1 });

  if (!Object.keys(allowTypes).includes(type)) {
    return;
  }

  if (!allowTypes[type].includes(action)) {
    return;
  }

  let syncLog = await models.SyncLogs.syncLogsAdd(syncLogDoc);
  let response: any;

  try {
    switch (type) {
      case 'contacts:customer':
        response = await customerMethod(
          action,
          preSuccessValue,
          subdomain,
          models,
          syncLog,
          params,
        );
        break;
      case 'savings:contract':
        response = await savingContractMethod(
          action,
          preSuccessValue,
          subdomain,
          models,
          syncLog,
          params,
        );
        break;
      case 'savings:transaction':
        response = await savingsTransactionMethod(subdomain, models, syncLog, params);
        break;
      case 'loans:contract':
        response = await loansContractMethod(
          action,
          preSuccessValue,
          subdomain,
          models,
          syncLog,
          params,
        );
        break;
      case 'loans:classification':
        response = await createChangeClassification(subdomain, models, syncLog, params);
        break;
      case 'loans:transaction':
        response = await loansTransactionMethod(subdomain, models, syncLog, params);
        break;
    }

    await models.SyncLogs.updateOne(
      { _id: syncLog._id },
      {
        $set: { responseData: response, responseStr: JSON.stringify(response) },
      },
    );
  } catch (e) {
    await models.SyncLogs.updateOne(
      { _id: syncLog._id },
      { $set: { error: e.message } },
    );
  }
};

const customerMethod = async (action, preSuccessValue, subdomain, models, syncLog, params) => {
  if (action === 'create' || !preSuccessValue)
    return await createCustomer(subdomain, models, syncLog, params);
  else if (action === 'update') return await updateCustomer(subdomain, models, syncLog, params);
}

const savingContractMethod = async (
  action,
  preSuccessValue,
  subdomain,
  models,
  syncLog,
  params,
) => {
  if (action === 'create' || !preSuccessValue) {
    if (params.object.isDeposit === true) {
      return await createDeposit(subdomain, models, syncLog, params);
    } else return await createSaving(subdomain, models, syncLog, params);
  } else if (action === 'update') {
    if (params.object.isDeposit === true) {
      return await updateDeposit(subdomain, models, syncLog, params);
    } else return await updateSaving(subdomain, models, syncLog, params);
  }
}

const savingsTransactionMethod = async (subdomain, models, syncLog, params) => {
  if (params.object.transactionType === 'income') {
    return await incomeSaving(subdomain, models, syncLog, params);
  } else if (params.object.transactionType === 'outcome')
    return await outcomeSaving(subdomain, models, syncLog, params);
}

const loansContractMethod = async (action, preSuccessValue, subdomain, models, syncLog, params) => {
  if (action === 'create' || !preSuccessValue)
    return await createLoan(subdomain, models, syncLog, params);
  else if (action === 'update') return await updateLoan(subdomain, models, syncLog, params);
}

const loansTransactionMethod = async (subdomain, models, syncLog, params) => {
  if (params.object.transactionType === 'repayment') {
    return await createLoanRepayment(subdomain, models, syncLog, params.object);
  } else if (params.object.transactionType === 'give')
    return await createLoanGive(subdomain, models, syncLog, params.object);
}

export default allowTypes;
