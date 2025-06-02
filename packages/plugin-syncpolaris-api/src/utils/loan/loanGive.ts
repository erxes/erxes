import { generateModels } from '../../connectionResolver';
import {
  customFieldToObject,
  fetchPolaris,
  getContract,
  getCustomer,
  getDepositAccount
} from '../utils';
import { IPolarisLoanGive } from './types';

export const createLoanGive = async (subdomain, polarisConfig, transaction) => {
  const models = await generateModels(subdomain);

  const syncLogDoc = {
    type: '',
    contentType: 'loans:transaction',
    contentId: transaction._id,
    createdAt: new Date(),
    createdBy: '',
    consumeData: transaction,
    consumeStr: JSON.stringify(transaction)
  };

  let syncLog = await models.SyncLogs.syncLogsAdd(syncLogDoc);

  const loanContract = await getContract(
    subdomain,
    { _id: transaction.contractId },
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

  const loanGive: IPolarisLoanGive = {
    txnAcntCode: loanContract.number,
    txnAmount: transaction.total,
    curCode: transaction.currency,
    rate: 1,
    contAcntCode: depositAccount.number,
    contAmount: transaction.total,
    contCurCode: transaction.currency,
    contRate: 1,
    rateTypeId: '16',
    txnDesc: transaction?.description || 'zeel olgov',
    tcustName: customerData?.firstName || 'ТЭМҮҮЖИН',
    tcustAddr: customerData?.address || 'test',
    tcustRegister: customerData?.registerCode || 'уш96100976',
    tcustRegisterMask: '3',
    tcustContact: customerData?.mobile || '85114503',
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

  return loanGiveReponse.txnJrno;
};
