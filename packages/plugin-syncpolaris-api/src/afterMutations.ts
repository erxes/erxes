import { generateModels } from './connectionResolver';
import { createCustomer } from './utils/customer/createCustomer';
import { updateCustomer } from './utils/customer/updateCustomer';
import { createDeposit } from './utils/deposit/createDeposit';
import { incomeDeposit } from './utils/deposit/incomeDeposit';
import { outcomeDeposit } from './utils/deposit/outcomeDeposit';
import { updateDeposit } from './utils/deposit/updateDeposit';
import { createChangeClassification } from './utils/loan/changeClassification';
import { createLoan } from './utils/loan/createLoan';
import { createLoanGive } from './utils/loan/loanGive';
import { createLoanRepayment } from './utils/loan/loanRepayment';
import { updateLoan } from './utils/loan/updateLoan';
import { createSaving } from './utils/saving/createSaving';
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

  console.log('type+----->', type, action);

  try {
    switch (type) {
      case 'contacts:customer':
        if (action === 'create' || !preSuccessValue)
          response = await createCustomer(subdomain, params);
        else if (action === 'update')
          response = await updateCustomer(subdomain, params);
        break;
      case 'savings:contract':
        const savingContract = params.object;
        console.log('savingContract', savingContract);
        if (action === 'create' || !preSuccessValue) {
          if (savingContract.isDeposit === true) {
            response = await createDeposit(subdomain, params);
          } else response = await createSaving(subdomain, params);
        } else if (action === 'update') {
          if (savingContract.isDeposit === true) {
            response = await updateDeposit(subdomain, params);
          } else response = await updateSaving(subdomain, params);
        }
        break;
      case 'savings:transaction':
        const savingTransaction = params.object;
        if (savingTransaction.transactionType === 'income') {
          response = await incomeDeposit(subdomain, params);
        } else if (savingTransaction.transactionType === 'outcome')
          response = await outcomeDeposit(subdomain, params);
        break;
      case 'loans:contract':
        if (action === 'create' || !preSuccessValue)
          response = await createLoan(subdomain, params);
        else if (action === 'update')
          response = await updateLoan(subdomain, params);
        break;
      case 'loans:classification':
        response = await createChangeClassification(subdomain, params);
        break;
      case 'loans:transaction':
        const loanTransaction = params.object;
        if (loanTransaction.transactionType === 'income') {
          response = await createLoanRepayment(subdomain, params);
        } else if (loanTransaction.transactionType === 'outcome')
          response = await createLoanGive(subdomain, params);
        break;
    }
    await models.SyncLogs.updateOne(
      { _id: syncLog._id },
      {
        $set: { responseData: response, responseStr: JSON.stringify(response) },
      },
    );
  } catch (e) {
    console.log('e', e);
    await models.SyncLogs.updateOne(
      { _id: syncLog._id },
      { $set: { error: e.message } },
    );
  }
};

export default allowTypes;
