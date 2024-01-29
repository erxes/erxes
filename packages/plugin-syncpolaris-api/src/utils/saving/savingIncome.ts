import { fetchPolaris, getSavingContract } from '../utils';

export const savingIncome = async (subdomain, params) => {
  const savingTransactionParams = params.updatedDocument || params.object;

  const savingContract = await getSavingContract(
    subdomain,
    savingTransactionParams.savingContractId,
  );

  let sendData = {
    operCode: '13610015',
    txnAcntCode: savingContract.number,
    txnAmount: savingTransactionParams.total,
    rate: 1,
    rateTypeId: null,
    contAmount: savingTransactionParams.total,
    contRate: 1,
    contCurCode: savingTransactionParams.currency ?? 'MNT',
    txnDesc: savingTransactionParams.description ?? 'test',
    banknotes: [],
    changeBanknotes: [],
    sourceType: 'TLLR',
    isPreview: 0,
    isPreviewFee: null,
    isTmw: 1,
    aspParam: [
      [
        {
          acntCode: savingContract.number,
          acntType: 'INCOME',
        },
      ],
    ],
  };

  fetchPolaris({
    op: '13610015',
    data: [sendData],
    subdomain,
  });
};
