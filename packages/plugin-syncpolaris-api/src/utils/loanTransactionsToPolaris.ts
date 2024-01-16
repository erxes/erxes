import {
  getConfig,
  getDepositAccount,
  getLoanContract,
  toPolaris,
} from './utils';

export const loanTransactionsToPolaris = async (
  subdomain,
  params,
  action: 'create' | 'update',
) => {
  const config = await getConfig(subdomain, 'POLARIS', {});

  const transaction = params.updatedDocument || params.object;

  const loanContract = await getLoanContract(subdomain, transaction.contractId);

  const customer = await getLoanContract(subdomain, loanContract.customerId);

  if (transaction.transactionType === 'give') {
    const depositAccount = await getDepositAccount(subdomain, loanContract._id);
    await loanGive(config, loanContract, transaction, customer, depositAccount);
    return;
  }

  let sendData = [
    {
      txnAcntCode: loanContract.number,
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
          payCustCode: customer.code,
          princPayAmt: transaction.calcedInfo.payment,
          billIntPayAmt: transaction.calcedInfo.payment,
          intPayAmt: transaction.calcedInfo.storedInterest,
          finePayAmt: transaction.calcedInfo.undue,
          billFinepBal: 0,
          billFinebBal: 0,
          billCommIntPayAmt: transaction.calcedInfo.commitmentInterest,
          commIntPayAmt: transaction.calcedInfo.commitmentInterest,
        },
      ],
      txnDesc: transaction.description,
      tcustName: customer.firstName,
      tcustAddr: customer.address,
      tcustRegister: customer.register,
      tcustRegisterMask: '1',
      tcustContact: customer.phoneNumber,
      identityType: 'MANUAL',
      tranAmt: transaction.total,
      tranCurCode: transaction.currency,
    },
  ];

  let op = '';
  if (action === 'create') op = '13610313';
  else if (action === 'update') op = '13610315';

  await toPolaris({
    apiUrl: config.apiUrl,
    company: config.company,
    op: op,
    role: config.role,
    token: config.token,
    data: sendData,
  });
};

const loanGive = async (
  config: any,
  contract: any,
  transaction: any,
  customer: any,
  depositAccount: any,
) => {
  const sendData = [
    {
      txnAcntCode: contract.number,
      txnAmount: transaction.total,
      curCode: transaction.currency,
      rate: '1',
      contAcntCode: depositAccount.number,
      contAmount: transaction.total,
      contCurCode: depositAccount.currency,
      contRate: '1',
      rateTypeId: '16',
      txnDesc: transaction.description,
      tcustName: customer.firstName,
      tcustAddr: customer.address,
      tcustRegister: customer.register,
      tcustRegisterMask: '3',
      tcustContact: customer.phones?.[0],
      sourceType: 'TLLR',
      isTmw: 1,
      isPreview: 0,
      isPreviewFee: 0,
      addParams: [
        {
          contAcntType: 'CASA',
        },
      ],
    },
  ];

  await toPolaris({
    apiUrl: config.apiUrl,
    company: config.company,
    op: '13610262',
    role: config.role,
    token: config.token,
    data: sendData,
  });
};
