import {
  customFieldToObject,
  fetchPolaris,
  getCustomer,
  getDepositAccount,
  getContract,
  updateTransaction
} from '../utils';
import { IPolarisRepayment } from './types';

export const createLoanRepayment = async (
  subdomain,
  models,
  polarisConfig,
  transaction
) => {
  const loanContract = await getContract(
    subdomain,
    { _id: transaction.contractId },
    'loans'
  );

  const syncLogDoc = {
    type: '',
    contentType: 'loans:transaction',
    contentId: loanContract.number,
    createdAt: new Date(),
    createdBy: '',
    consumeData: transaction,
    consumeStr: JSON.stringify(transaction)
  };

  let syncLog = await models.SyncLogs.syncLogsAdd(syncLogDoc);

  const customer = await getCustomer(subdomain, loanContract.customerId);

  const deposit = await getDepositAccount(subdomain, customer._id);

  const getAccounts = await fetchPolaris({
    op: '13610312',
    data: [customer?.code, 0, 20],
    subdomain,
    polarisConfig
  });

  const customerAccount = getAccounts.filter(
    (account) => account.acntType === 'CA'
  );

  const polarisNumber =
    customerAccount && customerAccount.length > 0
      ? customerAccount[0].acntCode
      : '';

  const customerData = await customFieldToObject(
    subdomain,
    'core:customer',
    customer
  );

  const loanRepayment: IPolarisRepayment = {
    txnAcntCode: loanContract.number,
    txnAmount: transaction.total,
    rate: 1,
    rateTypeId: '16',
    contAcntCode: deposit?.number ?? polarisNumber ?? '',
    contAmount: transaction.total,
    contRate: 1,
    txnDesc: `${customerData.registerCode} ${transaction.description}`,
    tcustRegister: customerData.registerCode,
    tcustRegisterMask: '3',
    sourceType: 'TLLR',
    isPreview: 0,
    isPreviewFee: null,
    isTmw: 1
  };

  const loanRepaymentReponse = await fetchPolaris({
    subdomain,
    op: '13610250',
    data: [loanRepayment],
    models,
    polarisConfig,
    syncLog
  });

  await updateTransaction(
    subdomain,
    { _id: transaction._id },
    {
      $set: {
        isSyncedTransaction: true
      }
    },
    'loans'
  );

  return loanRepaymentReponse.txnJrno;
};
