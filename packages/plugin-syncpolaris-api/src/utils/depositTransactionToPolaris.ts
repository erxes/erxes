import { getConfig, toPolaris } from './utils';

export const depositTransactionToPolaris = async (
  subdomain,
  params,
  action: 'income' | 'outcome'
) => {
  const config = await getConfig(subdomain, 'POLARIS', {});
  let op = '';
  if (action === 'income') op = '13610009';
  else if (action === 'outcome') op = '13610010';

  const transactionParams = params.object;
  let sendData = {};

  sendData = [
    {
      operCode: op,
      txnAcntCode: transactionParams.txnAcntCode,
      txnAmount: transactionParams.txnAmount,
      rate: transactionParams.rate,
      //rateTypeId: transactionParams.rateTypeId, debit
      contAmount: transactionParams.contAmount,
      contCurCode: transactionParams.contCurCode,
      contRate: transactionParams.contRate,
      txnDesc: transactionParams.txnDesc,
      tcustName: transactionParams.tcustName,
      tcustAddr: transactionParams.tcustName,
      tcustRegister: transactionParams.tcustRegister,
      tcustRegisterMask: transactionParams.tcustRegister,
      tcustContact: transactionParams.tcustContact,
      tranAmt: transactionParams.tranAmt,
      tranCurCode: transactionParams.tranCurCode,
      banknotes: [
        {
          banknoteId: transactionParams.banknoteId,
          qty: transactionParams.qty,
          totalAmount: transactionParams.qty
        }
      ],
      //changeBanknotes: transactionParams.changeBanknotes, debit
      sourceType: transactionParams.sourceType,
      isPreview: transactionParams.isPreview,
      isTmw: transactionParams.isTmw,
      aspParam: [
        [
          {
            acntCode: transactionParams.acntCode,
            acntType: transactionParams.acntType
          }
        ]
      ]

      //isPreviewFee: transactionParams.isPreviewFee, debit
      //isAdvice: transactionParams.isAdvice, debit
      //txnClearAmount: transactionParams.txnClearAmount,
    }
  ];

  toPolaris({
    apiUrl: config.apiUrl,
    company: config.company,
    op: '13610120',
    role: config.role,
    token: config.token,
    data: sendData
  });
};

export const depositDebitCase = async (subdomain, params) => {
  const config = await getConfig(subdomain, 'POLARIS', {});
  const debitParams = params.updatedDocument || params.object;
  let sendData = {};
  sendData = [
    {
      operCode: '13610009',
      txnAcntCode: debitParams.contractId, //
      txnAmount: debitParams.total,
      rate: debitParams.rate,
      rateTypeId: debitParams.rateTypeId,
      contAmount: debitParams.contAmount,
      contCurCode: debitParams.contCurCode,
      contRate: debitParams.contRate,
      txnDesc: debitParams.txnDesc,
      banknotes: [
        {
          banknoteId: debitParams.banknoteId,
          qty: debitParams.qty,
          totalAmount: debitParams.totalAmount
        }
      ],
      changeBanknotes: debitParams.changeBanknotes,
      tcustRegisterMask: debitParams.tcustRegisterMask,
      sourceType: debitParams.sourceType,
      isPreview: debitParams.isPreview,
      isPreviewFee: debitParams.isPreviewFee,
      isTmw: debitParams.isTmw,
      isAdvice: debitParams.isAdvice,
      txnClearAmount: debitParams.txnClearAmount,
      aspParam: [
        [
          {
            acntCode: debitParams.acntCode,
            acntType: debitParams.acntType
          }
        ]
      ]
    }
  ];
  toPolaris({
    apiUrl: config.apiUrl,
    company: config.company,
    op: '13610009',
    role: config.role,
    token: config.token,
    data: sendData
  });
};

export const depositCreditCase = async (subdomain, params) => {
  const config = await getConfig(subdomain, 'POLARIS', {});
  const creditParams = params.updatedDocument || params.object;
  let sendData = {};

  sendData = [
    {
      operCode: creditParams.operCode,
      txnAcntCode: creditParams.txnAcntCode,
      txnAmount: creditParams.txnAmount,
      rate: creditParams.rate,
      contAmount: creditParams.contAmount,
      contCurCode: creditParams.contCurCode,
      contRate: creditParams.contRate,
      txnDesc: creditParams.txnDesc,
      tcustName: creditParams.tcustName,
      tcustAddr: creditParams.tcustName,
      tcustRegister: creditParams.tcustRegister,
      tcustRegisterMask: creditParams.tcustRegister,
      tcustContact: creditParams.tcustContact,
      tranAmt: creditParams.tranAmt,
      tranCurCode: creditParams.tranCurCode,
      banknotes: [
        {
          banknoteId: creditParams.banknoteId,
          qty: creditParams.qty,
          totalAmount: creditParams.qty
        }
      ],
      sourceType: creditParams.sourceType,
      isPreview: creditParams.isPreview,
      isTmw: creditParams.isTmw,
      aspParam: [
        [
          {
            acntCode: creditParams.acntCode,
            acntType: creditParams.acntType
          }
        ]
      ]
    }
  ];
  toPolaris({
    apiUrl: config.apiUrl,
    company: config.company,
    op: '13610010',
    role: config.role,
    token: config.token,
    data: sendData
  });
};
