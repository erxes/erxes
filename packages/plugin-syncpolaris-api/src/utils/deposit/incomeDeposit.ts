import { fetchPolaris } from '../utils';

export const incomeDeposit = async (subdomain, params) => {
  const transaction = params.object;
  let sendData = {};

  sendData = [
    {
      operCode: '13610009',
      txnAcntCode: transaction.contractId,
      txnAmount: transaction.total,
      rate: transaction.rate,

      contAmount: transaction.contAmount,
      contCurCode: transaction.contCurCode,
      contRate: transaction.contRate,
      txnDesc: transaction.txnDesc,
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
            acntCode: transaction.acntCode,
            acntType: transaction.acntType,
          },
        ],
      ],
      // tcustName: transaction.tcustName, //outcome
      // tcustAddr: transaction.tcustName, //outcome
      // tcustRegister: transaction.tcustRegister, //outcome
      // tcustContact: transaction.tcustContact, //outcome
      // tranAmt: transaction.tranAmt, //outcome
      // tranCurCode: transaction.tranCurCode, //outcome
      // changeBanknotes: debitParams.changeBanknotes, //income
      // rateTypeId :  transaction.rateTypeId //income
    },
  ];

  fetchPolaris({
    op: '13610009',
    data: sendData,
    subdomain,
  });
};
