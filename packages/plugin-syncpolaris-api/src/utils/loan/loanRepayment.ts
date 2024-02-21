import {
  customFieldToObject,
  fetchPolaris,
  getCustomer,
  getDepositAccount,
  getLoanContract,
} from '../utils';
import { IPolarisRepayment } from './types';

export const createLoanRepayment = async (subdomain, transaction) => {
  const loanContract = await getLoanContract(subdomain, transaction.contractId);

  const customer = await getCustomer(subdomain, loanContract.customerId);

  const deposit = await getDepositAccount(subdomain, customer._id);

  const customerData = await customFieldToObject(
    subdomain,
    'contacts:customer',
    customer,
  );

  const loanRepayment: IPolarisRepayment = {
    txnAcntCode: loanContract.number,
    txnAmount: transaction.total,
    rate: 1,
    rateTypeId: '16',
    contAcntCode: deposit.number,
    contAmount: transaction.total,
    contRate: 1,
    txnDesc: `${customerData.registerCode} ${transaction.description}`,
    tcustRegister: customerData.registerCode,
    tcustRegisterMask: '3',
    sourceType: 'TLLR',
    isPreview: 0,
    isPreviewFee: null,
    isTmw: 1,
  };

  const loanRepaymentReponse = await fetchPolaris({
    subdomain,
    op: '13610250',
    data: [loanRepayment],
  }).then((response) => JSON.parse(response));

  return loanRepaymentReponse.txnJrno;
};
