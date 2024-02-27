import { fetchPolaris, getSavingContract } from '../utils';

export const incomeDeposit = async (subdomain, params) => {
  const transaction = params.object;

  const savingContract = await getSavingContract(
    subdomain,
    transaction.contractId,
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
    tcustRegisterMask: '',
    sourceType: 'OI',
    isPreview: 0,
    isPreviewFee: null,
    isTmw: 1,
    isAdvice: 1,
    txnClearAmount: transaction.total,
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
