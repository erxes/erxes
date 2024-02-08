import {
  customFieldToObject,
  fetchPolaris,
  getCustomer,
  getDepositAccount,
  getLoanContract,
  getLoanContractAccount,
  getLoanProduct,
} from '../utils';
import { IPolarisRepayment } from './types';

export const createLoanPreRepayment = async (subdomain, transaction) => {
  const loanContract = await getLoanContract(subdomain, transaction.contractId);

  const loanContractType = await getLoanProduct(
    subdomain,
    loanContract.contractTypeId,
  );

  const customer = await getCustomer(subdomain, loanContract.customerId);

  const deposit = await getDepositAccount(subdomain, customer._id);

  const customerData = await customFieldToObject(
    subdomain,
    'contacts:customer',
    customer,
  );

  const loanAccount = getLoanContractAccount(loanContractType, loanContract);

  const loanChangeClassification: IPolarisRepayment = {
    txnAcntCode: loanAccount,
    txnAmount: transaction.total,
    rate: 1,
    rateTypeId: '16',
    contAcntCode: deposit.number,
    contAmount: transaction.total,
    contRate: 1,
    txnDesc: transaction.description,
    tcustRegister: customerData.registerCode,
    tcustRegisterMask: '3',
    sourceType: 'TLLR',
    isPreview: 0,
    isPreviewFee: null,
    isTmw: 1,
    addParams: [{ PAYCUSTCODE: '', contAcntType: 'BAC' }],
  };

  const loanRepaymentReponse = await fetchPolaris({
    subdomain,
    op: '13610250',
    data: [loanChangeClassification],
  }).then((response) => JSON.parse(response));

  return loanRepaymentReponse.txnJrno;
};
