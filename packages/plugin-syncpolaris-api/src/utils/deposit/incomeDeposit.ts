import { fetchPolaris, getSavingContract } from '../utils';

export const incomeDeposit = async (subdomain, params) => {
  const transaction = params.object;

  const savingContract = await getSavingContract(
    subdomain,
    transaction.savingContractId,
  );

  let sendData = {
    operCode: '13610009',
    txnAcntCode: savingContract.number,
    txnAmount: transaction.total,
    rate: '1',

    contAmount: transaction.total,
    contCurCode: transaction.currency,
    contRate: '1',
    txnDesc: transaction.description,
    banknotes: [
      {
        banknoteId: transaction.banknoteId,
        qty: transaction.qty,
        totalAmount: transaction.totalAmount,
      },
    ],
    tcustRegisterMask: transaction.tcustRegisterMask,
    sourceType: transaction.sourceType,
    isPreview: transaction.isPreview,
    isPreviewFee: transaction.isPreviewFee,
    isTmw: transaction.isTmw,
    isAdvice: transaction.isAdvice,
    txnClearAmount: transaction.txnClearAmount,
    aspParam: [
      [
        {
          acntCode: 'txnAcntCode',
          acntType: 'INCOME',
        },
      ],
    ],
  };

  return await fetchPolaris({
    op: '13610009',
    data: [sendData],
    subdomain,
  });
};
