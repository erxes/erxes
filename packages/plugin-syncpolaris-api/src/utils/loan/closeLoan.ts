import { fetchPolaris, getDepositAccount, getContract } from "../utils";

export const createLoanClose = async (
  subdomain,
  polarisConfig,
  config,
  transaction
) => {
  const loanContract = await getContract(
    subdomain,
    { _id: transaction.contractId },
    "loans"
  );

  const depositAccount = await getDepositAccount(
    subdomain,
    loanContract.customerId
  );

  const loanClose = {
    txnAcntCode: loanContract.number,
    txnAmount: transaction.total,
    curCode: transaction.currency,
    rate: 1,
    rateTypeId: "4",
    contAcntCode: depositAccount.number,
    contAmount: transaction.total,
    contRate: 1,
    contCurCode: transaction.currency,
    txnDesc: transaction.description,
    sourceType: "OI",
    isPreview: 0,
    isPreviewFee: null,
    isTmw: 1,
    aspParam: [
      [
        {
          acntCode: depositAccount.transAccount,
          acntType: "INCOME"
        },
        {
          acntCode: loanContract.number,
          acntType: "EXPENSE"
        }
      ],
      13600107
    ],
    addParams: [
      {
        contAcntType: "CASA",
        chkAcntInt: "N"
      }
    ]
  };

  const loanGiveReponse = await fetchPolaris({
    subdomain,
    op: "13610267",
    data: [loanClose],
    polarisConfig
  });

  return loanGiveReponse.txnJrno;
};
