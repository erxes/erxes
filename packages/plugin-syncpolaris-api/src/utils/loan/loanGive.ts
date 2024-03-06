import {
  customFieldToObject,
  fetchPolaris,
  getCustomer,
  getDepositAccount,
  getLoanContract,
} from '../utils';
import { IPolarisLoanGive } from './types';

export const createLoanGive = async (subdomain, transaction) => {
  const customer = await getCustomer(subdomain, transaction.customerId);

  const customerData = await customFieldToObject(
    subdomain,
    'contacts:customer',
    customer,
  );

  const depositAccount = await getDepositAccount(
    subdomain,
    transaction.customerId,
  );

  const loanContract = await getLoanContract(subdomain, transaction.contractId);

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
    txnDesc: transaction.description,
    tcustName: customerData.firstName,
    tcustAddr: customerData.address,
    tcustRegister: customerData.registerCode,
    tcustRegisterMask: '3',
    tcustContact: customerData.mobile,
    sourceType: 'TLLR',
    isTmw: 1,
    isPreview: 0,
    isPreviewFee: 0,
    addParams: [
      {
        contAcntType: 'CASA',
      },
    ],
  };

  const loanGiveReponse = await fetchPolaris({
    subdomain,
    op: '13610262',
    data: [loanGive],
  }).then((response) => JSON.parse(response));

  return loanGiveReponse.txnJrno;
};
