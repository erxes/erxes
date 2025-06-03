import { generateModels } from '../../connectionResolver';
import {
  customFieldToObject,
  fetchPolaris,
  getContract,
  getCustomer,
  getDepositAccount,
  updateTransaction
} from '../utils';
import { IPolarisLoanGive } from './types';

export const createLoanGive = async (subdomain, polarisConfig, transaction) => {
  const models = await generateModels(subdomain);

  const savingContract = await getContract(
    subdomain,
    { _id: transaction[0].contractId },
    'loans'
  );

  if (!savingContract) {
    throw new Error('Contract not found');
  }

  const syncLogDoc = {
    type: '',
    contentType: 'loans:transaction',
    contentId: savingContract.number,
    createdAt: new Date(),
    createdBy: '',
    consumeData: transaction,
    consumeStr: JSON.stringify(transaction)
  };

  let syncLog = await models.SyncLogs.syncLogsAdd(syncLogDoc);

  const loanContract = await getContract(
    subdomain,
    { _id: transaction[0].contractId },
    'loans'
  );

  const customer = await getCustomer(subdomain, loanContract.customerId);

  const customerData = await customFieldToObject(
    subdomain,
    'core:customer',
    customer
  );

  const depositAccount = await getDepositAccount(
    subdomain,
    loanContract.customerId
  );

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

  const loanGive: IPolarisLoanGive = {
    txnAcntCode: loanContract.number,
    txnAmount: transaction[0].total,
    curCode: transaction[0].currency,
    rate: 1,
    contAcntCode: depositAccount?.number ?? polarisNumber ?? '',
    contAmount: transaction[0].total,
    contCurCode: transaction[0].currency,
    contRate: 1,
    rateTypeId: '16',
    txnDesc: transaction[0].description ?? 'zeel olgov',
    tcustName: customerData?.firstName ?? '',
    tcustAddr: customerData?.address ?? '',
    tcustRegister: customerData?.registerCode ?? '',
    tcustRegisterMask: '3',
    tcustContact: customerData?.mobile ?? '',
    sourceType: 'TLLR',
    isTmw: 1,
    isPreview: 0,
    isPreviewFee: 0,
    addParams: [
      {
        contAcntType: 'CASA'
      }
    ]
  };

  const loanGiveReponse = await fetchPolaris({
    subdomain,
    op: '13610262',
    data: [loanGive],
    models,
    polarisConfig,
    syncLog
  });

  await updateTransaction(
    subdomain,
    { _id: transaction[0]._id },
    {
      $set: {
        isSyncedTransaction: true
      }
    },
    'loans'
  );

  return loanGiveReponse.txnJrno;
};
