import { generateModels } from './connectionResolver';
import { createCustomer } from './utils/customer/createCustomer';
import { getCustomerFromPolaris } from './utils/customer/getCustomerDetail';
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
import { getConfig } from './utils/utils';

const allowTypes = {
  "core:customer": ["create", "update"],
  "core:company": ["create", "update"],
  //deposit
  "savings:transaction": ["create"],
  //saving
  "savings:contract": ["create", "update"],
  //loan
  "loans:contract": ["create", "update"],
  "loans:classification": ["create"],
  "loans:transaction": ["create"]
};

export const afterMutationHandlers = async (subdomain, params) => {
  const { type, action, user } = params;

  const models = await generateModels(subdomain);
  const polarisConfig = await getConfig(subdomain, 'POLARIS', {});

  if (!polarisConfig || !polarisConfig.apiUrl || !polarisConfig.token || !polarisConfig.companyCode || !polarisConfig.role) {
    return;
  }

  const syncLogDoc = {
    type: "",
    contentType: type,
    contentId: params.object._id,
    createdAt: new Date(),
    createdBy: user._id,
    consumeData: params,
    consumeStr: JSON.stringify(params)
  };

  const preSuccessValue = await models.SyncLogs.findOne({
    contentType: type,
    contentId: params.object._id,
    error: { $exists: false },
    responseData: { $exists: true, $ne: null }
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
      case "core:customer":
        response = await customerMethod(
          subdomain,
          models,
          polarisConfig,
          syncLog,
          params
        );
        break;
      case "savings:contract":
        response = await savingContractMethod(
          action,
          preSuccessValue,
          subdomain,
          models,
          polarisConfig,
          syncLog,
          params
        );
        break;
      case 'savings:transaction':
        response = await savingsTransactionMethod(subdomain, models, polarisConfig, syncLog, params);
        break;
      case "loans:contract":
        response = await loansContractMethod(
          action,
          preSuccessValue,
          subdomain,
          models,
          polarisConfig,
          syncLog,
          params
        );
        break;
      case 'loans:classification':
        response = await createChangeClassification(subdomain, models, polarisConfig, syncLog, params);
        break;
      case 'loans:transaction':
        response = await loansTransactionMethod(subdomain, models, polarisConfig, syncLog, params);
        break;
    }
  } catch (e) {
    await models.SyncLogs.updateOne(
      { _id: syncLog._id },
      { $set: { error: e.message } }
    );
  }
};

const customerMethod = async (subdomain, models, polarisConfig, syncLog, params) => {
  const customer = params.updatedDocument || params.object;
  const { isPush, registerField, codeField } = polarisConfig;

  if (!isPush || !registerField?.fieldId || !codeField?.fieldId) {
    return;
  }

  const { registerCode, custCode, polarisCustomer } = await getCustomerFromPolaris(subdomain, customer, polarisConfig);

  if (!registerCode) {
    return;
  }

  if (custCode && polarisCustomer) {
    return await updateCustomer(subdomain, models, polarisConfig, syncLog, { ...customer, custCode, registerCode });
  }

  return await createCustomer(subdomain, models, polarisConfig, syncLog, { ...customer, registerCode });
};

const savingContractMethod = async (
  action,
  preSuccessValue,
  subdomain,
  models,
  polarisConfig,
  syncLog,
  params
) => {
  if (action === "create" || action === "update") {
    if (!preSuccessValue) {
      if (params.object.isDeposit === true) {
        return await createDeposit(subdomain, models, polarisConfig, syncLog, params);
      }
      return await createSaving(subdomain, models, polarisConfig, syncLog, params);
    }

    if (params.object.isDeposit === true) {
      return await updateDeposit(subdomain, models, polarisConfig, syncLog, params);
    }
    return await updateSaving(subdomain, models, polarisConfig, syncLog, params);
  }
};

const savingsTransactionMethod = async (subdomain, models, polarisConfig, syncLog, params) => {
  if (params.object.transactionType === 'income') {
    return await incomeSaving(subdomain, models, polarisConfig, syncLog, params);
  }

  if (params.object.transactionType === 'outcome') {
    return await outcomeSaving(subdomain, models, polarisConfig, syncLog, params);
  }
};

const loansContractMethod = async (action, preSuccessValue, subdomain, models, polarisConfig, syncLog, params) => {
  if (action === 'create' || action === 'update') {
    if (!preSuccessValue) {
      return await createLoan(subdomain, models, polarisConfig, syncLog, params);
    }
    return await updateLoan(subdomain, models, polarisConfig, syncLog, params);
  }
};

const loansTransactionMethod = async (subdomain, models, polarisConfig, syncLog, params) => {
  if (params.object.transactionType === 'repayment') {
    return await createLoanRepayment(subdomain, models, polarisConfig, syncLog, params.object);
  }

  if (params.object.transactionType === 'give') {
    return await createLoanGive(subdomain, models, polarisConfig, syncLog, params.object);
  }
};

export default allowTypes;
