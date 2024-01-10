import { getConfig, toPolaris } from './utils';

export const loansToPolaris = async (
  subdomain,
  params,
  action: 'create' | 'update'
) => {
  const config = await getConfig(subdomain, 'POLARIS', {});

  const transaction = params.updatedDocument || params.object;

  let sendData = [
    {
      txnAcntCode: transaction.number,
      txnAmount: transaction.total,
      rate: 1,
      curCode: transaction.currency,
      rateTypeId: '20',
      contAcntCode: transaction.number,
      contAmount: transaction.total,
      contRate: 1,
      contCurCode: transaction.currency,
      sourceType: 'OI',
      isPreview: 1,
      isPreviewFee: 0,
      isTmw: 1,
      addParams: [
        {
          payCustCode: '',
          princPayAmt: transaction.calcedInfo.payment,
          billIntPayAmt: transaction.calcedInfo.payment,
          intPayAmt: transaction.calcedInfo.storedInterest,
          finePayAmt: transaction.calcedInfo.undue,
          billFinepBal: 0,
          billFinebBal: 0,
          billCommIntPayAmt: transaction.calcedInfo.commitmentInterest,
          commIntPayAmt: transaction.calcedInfo.commitmentInterest
        }
      ],
      txnDesc: transaction.description,
      tcustName: transaction.tcustName,
      tcustAddr: transaction.tcustAddr,
      tcustRegister: transaction.tcustRegister,
      tcustRegisterMask: transaction.tcustRegisterMask,
      tcustContact: transaction.tcustContact,
      identityType: 'MANUAL',
      tranAmt: transaction.total,
      tranCurCode: transaction.total.currency
    }
  ];

  let op = '';
  if (action === 'create') op = '13610313';
  else if (action === 'update') op = '13610315';

  toPolaris({
    apiUrl: config.apiUrl,
    company: config.company,
    op: op,
    role: config.role,
    token: config.token,
    data: sendData
  });
};
