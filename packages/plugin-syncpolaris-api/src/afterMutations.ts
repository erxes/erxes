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
  });

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
          params,
        );
        break;
      case 'savings:contract':
        response = await savingContractMethod(
          action,
          preSuccessValue,
          subdomain,
          params,
        );
        break;
      case 'savings:transaction':
        response = await savingsTransactionMethod(subdomain, params);
        break;
      case 'loans:contract':
        response = await loansContractMethod(
          action,
          preSuccessValue,
          subdomain,
          params,
        );
        break;
      case 'loans:classification':
        response = await createChangeClassification(subdomain, params);
        break;
      case 'loans:transaction':
        response = await loansTransactionMethod(subdomain, params);
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

async function customerMethod(action, preSuccessValue, subdomain, params) {
  if (action === 'create' || !preSuccessValue)
    return await createCustomer(subdomain, params);
  else if (action === 'update') return await updateCustomer(subdomain, params);
}

async function savingContractMethod(
  action,
  preSuccessValue,
  subdomain,
  params,
) {
  if (action === 'create' || !preSuccessValue) {
    if (params.object.isDeposit === true) {
      return await createDeposit(subdomain, params);
    } else return await createSaving(subdomain, params);
  } else if (action === 'update') {
    if (params.object.isDeposit === true) {
      return await updateDeposit(subdomain, params);
    } else return await updateSaving(subdomain, params);
  }
}

async function savingsTransactionMethod(subdomain, params) {
  if (params.object.transactionType === 'income') {
    return await incomeSaving(subdomain, params);
  } else if (params.object.transactionType === 'outcome')
    return await outcomeSaving(subdomain, params);
}

async function loansContractMethod(action, preSuccessValue, subdomain, params) {
  if (action === 'create' || !preSuccessValue)
    return await createLoan(subdomain, params);
  else if (action === 'update') return await updateLoan(subdomain, params);
}

async function loansTransactionMethod(subdomain, params) {
  if (params.object.transactionType === 'repayment') {
    return await createLoanRepayment(subdomain, params.object);
  } else if (params.object.transactionType === 'give')
    return await createLoanGive(subdomain, params.object);
}

export default allowTypes;
