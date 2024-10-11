import {
  customFieldToObject,
  fetchPolaris,
  getCustomer,
  getDepositAccount,
  getContract
} from "../utils";

export const createLoanRepayment = async (subdomain, polarisConfig, transaction) => {
  const loanContract = await getContract(
    subdomain,
    transaction.contractId,
    "loans"
  );

  const customer = await getCustomer(subdomain, loanContract.customerId);

  const deposit = await getDepositAccount(subdomain, customer._id);

  const customerData = await customFieldToObject(
    subdomain,
    "core:customer",
    customer
  );

  const loanRepayment = {
    txnAcntCode: loanContract.number,
    txnAmount: transaction.total,
    rate: 1,
    contAmount: transaction.total,
    contCurCode: transaction.currency,
    curCode: transaction.currency,
    contAcntCode: deposit.number,
    contRate: 1,
    txnDesc: `${customerData.registerCode} ${transaction.description}`,
    tcustName: customerData.firstName,
    tcustAddr: `${customerData.address}`,
    tcustRegister: customerData.registerCode,
    tcustRegisterMask: "3",
    tcustContact: customerData.mobile,
    isPreview: 0,
    isPreviewFee: 0,
    isTmw: 1,
    addParams: [
      {
        CALCMETHOD: 0,
        PREINTAMT: transaction.total,
        PREPRINCAMT: "",
        CUSTCODE: "",
        FUTUREPAYMENTDATE: transaction.payDate
      }
    ],
    tranAmt: transaction.total,
    tranCurCode: transaction.currency,
    cashBankNote: ""
  };

  const loanRepaymentReponse = await fetchPolaris({
    subdomain,
    op: '13610250',
    data: [loanRepayment],
    polarisConfig
  });

  return loanRepaymentReponse.txnJrno;
};
