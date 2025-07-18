import {
  fetchPolaris,
  getDepositAccount,
  getContract,
  getCustomer
} from "../utils";

export const createLoanClose = async (
  subdomain,
  polarisConfig,
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

  const customer = await getCustomer(subdomain, loanContract.customerId);

  const getAccounts = await fetchPolaris({
    op: "13610312",
    data: [customer?.code, 0, 20],
    subdomain,
    polarisConfig
  });

  const customerAccount = getAccounts.filter(
    (account) => account.acntType === "CA"
  );

  const polarisNumber =
    customerAccount && customerAccount.length > 0
      ? customerAccount[0].acntCode
      : "";

  const loanClose = {
    txnAcntCode: loanContract.number,
    txnAmount: transaction.total,
    curCode: transaction.currency,
    rate: 1,
    rateTypeId: "4",
    contAcntCode: depositAccount?.number ?? polarisNumber ?? "",
    contAmount: transaction.total,
    contRate: 1,
    contCurCode: transaction.currency,
    txnDesc: transaction?.description ?? "loan closing",
    sourceType: "OI",
    isPreview: 0,
    isPreviewFee: null,
    isTmw: 1,
    aspParam: [
      [
        {
          acntCode: depositAccount?.number ?? polarisNumber,
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
