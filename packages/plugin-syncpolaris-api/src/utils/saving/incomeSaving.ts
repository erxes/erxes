import { incomeDeposit } from '../deposit/incomeDeposit';
import { fetchPolaris, getSavingContract } from '../utils';

export const incomeSaving = async (subdomain, params) => {
  const savingTransactionParams = params.updatedDocument || params.object;

  const savingContract = await getSavingContract(
    subdomain,
    savingTransactionParams.contractId,
  );

  if (!savingContract) {
    throw new Error('Contract not found');
  }

  if (savingContract.isDeposit) {
    return await incomeDeposit(subdomain, params);
  }

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

  const result = await fetchPolaris({
    op: '13610015',
    data: [sendData],
    subdomain,
  });

  return result;
};
