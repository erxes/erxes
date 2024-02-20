import {
  fetchPolaris,
  getDepositAccount,
  getLoanContract,
  getLoanProduct,
} from '../utils';

export const createLoanClose = async (subdomain, transaction) => {
  const depositAccount = await getDepositAccount(
    subdomain,
    transaction.customerId,
  );

  const loanContract = await getLoanContract(subdomain, transaction.contractId);

  const loanContractType = await getLoanProduct(
    subdomain,
    loanContract.contractTypeId,
  );

  const loanClose = {
    txnAcntCode: loanContractType.transAccount,
    txnAmount: transaction.total,
    curCode: transaction.currency,
    rate: 1,
    rateTypeId: '4',
    contAcntCode: depositAccount.number,
    contAmount: transaction.total,
    contRate: 1,
    contCurCode: transaction.currency,
    txnDesc: transaction.description,
    sourceType: 'OI',
    isPreview: 0,
    isPreviewFee: null,
    isTmw: 1,
    aspParam: [
      [
        {
          acntCode: loanContractType.transAccount,
          acntType: 'INCOME',
        },
        {
          acntCode: depositAccount.number,
          acntType: 'EXPENSE',
        },
      ],
      13600107,
    ],
    addParams: [
      {
        contAcntType: 'CASA',
        chkAcntInt: 'N',
      },
    ],
  };

  const loanGiveReponse = await fetchPolaris({
    subdomain,
    op: '13610267',
    data: [loanClose],
  }).then((response) => JSON.parse(response));

  return loanGiveReponse.txnJrno;
};
