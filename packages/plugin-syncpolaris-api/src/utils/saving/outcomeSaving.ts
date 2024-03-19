import { outcomeDeposit } from '../deposit/outcomeDeposit';
import { fetchPolaris, getContract } from '../utils';

export const outcomeSaving = async (subdomain, params) => {
  const savingTransactionParams = params.updatedDocument || params.object;

  const savingContract = await getContract(
    subdomain,
    { _id: savingTransactionParams.contractId },
    'savings',
  );

  if (!savingContract) {
    throw new Error('Contract not found');
  }

  if (savingContract.isDeposit) {
    return await outcomeDeposit(subdomain, params);
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

  return await fetchPolaris({
    op: '13610015',
    data: [sendData],
    subdomain,
  });
};
