import {
  getBranch,
  getCloseInfo,
  getConfig,
  getCustomer,
  getDepositAccount,
  getLoanProduct,
  getUser,
  toPolaris,
  updateLoanNumber,
} from './utils';

export const loansToPolaris = async (
  subdomain,
  params,
  action: 'create' | 'update',
) => {
  const config = await getConfig(subdomain, 'POLARIS', {});

  const loan = params.updatedDocument || params.object;

  if (loan.status === 'closed') {
    const closeInfo = await getCloseInfo(
      subdomain,
      params.newData.contractId,
      params.newData.closeDate,
    );

    const depositAccount = await getDepositAccount(
      subdomain,
      params.newData.contractId,
    );

    await closeContract(
      config,
      params.newData,
      loan,
      closeInfo,
      depositAccount,
    );
    return;
  }

  const customer = await getCustomer(subdomain, loan.customerId);

  const loanProduct = await getLoanProduct(subdomain, loan.contractTypeId);

  const leasingExpert = await getUser(subdomain, loan.leasingExpertId);

  const branch = await getBranch(subdomain, loan.leasingExpertId);

  let sendData = [
    {
      custCode: customer.code,
      name: `${customer.code} ${customer.firstName} ${customer.code} ${customer.lastName}`,
      name2: loan.custCode,
      prodCode: loanProduct.code,
      prodType: 'LOAN',
      purpose: loan.purpose,
      subPurpose: loan.subPurpose,
      isNotAutoClass: 0,
      comRevolving: 0,
      dailyBasisCode: 'ACTUAL/365',
      curCode: loan.currency,
      approvAmount: loan.leaseAmount,
      impairmentPer: 0,
      approvDate: loan.startDate,
      acntManager: leasingExpert.code,
      brchCode: branch.code,
      IsGetBrchFromOutside: '0',
      segCode: 'loan.segCode',
      status: 'N',
      slevel: '1',
      classNoTrm: '1',
      classNoQlt: '1',
      classNo: '1',
      startDate: loan.startDate,
      endDate: loan.endDate,
      termLen: loan.tenor,
      termBasis: 'M',
      isBrowseAcntOtherCom: 0,
      repayPriority: 0,
      useSpclAcnt: 0,
      notSendToCib: 0,
      losMultiAcnt: 0,
      validLosAcnt: 1,
      secType: 0,
    },
  ];

  let op = '';
  if (action === 'create') op = '13610313';
  else if (action === 'update') op = '13610315';

  const result = await toPolaris({
    apiUrl: config.apiUrl,
    company: config.company,
    op: op,
    role: config.role,
    token: config.token,
    data: sendData,
  });

  if (action === 'create' && typeof result.body === 'string') {
    await updateLoanNumber(subdomain, loan._id, result.body);

    await openLoanContract(config, [result.body, 'данс нээв', null]);
    loan.number = result.body;
    await createLoanSchedule(config, loan);
  }
};

const openLoanContract = async (config, sendData) => {
  const result = await toPolaris({
    apiUrl: config.apiUrl,
    company: config.company,
    op: '13610263',
    role: config.role,
    token: config.token,
    data: sendData,
  });

  return result;
};
//["acntCode","startDate","calcAmt","payType","payFreq","payMonth","payDay1","payDay2","holidayOption","shiftPartialPay","shiftType","termFreeTimes","intTypeCode","endDate","AdvDate","description","escapeMonths","listNrs","isFixedPayment", "payAmt" ]

const createLoanSchedule = async (config: any, contract: any) => {
  const sendData = [
    contract.number,
    contract.startDate,
    contract.leaseAmount,
    '1',
    'M',
    null,
    contract.scheduleDays?.[0],
    contract.scheduleDays?.[1] ?? null,
    '1',
    0,
    null,
    0,
    'SIMPLE_INT',
    contract.endDate,
    null,
    contract.description,
    contract.skipAmountCalcMonth ?? null,
    contract.customPayment ?? null,
  ];

  const result = await toPolaris({
    apiUrl: config.apiUrl,
    company: config.company,
    op: '13610263',
    role: config.role,
    token: config.token,
    data: sendData,
  });

  return result;
};

const closeContract = async (
  config: any,
  closeData: any,
  loanContract: any,
  closeInfo: any,
  depositAccount: any,
) => {
  const sendData = [
    {
      txnAcntCode: loanContract.number,
      txnAmount: closeInfo.total,
      curCode: loanContract.currency,
      rate: 1,
      rateTypeId: '4',
      contAcntCode: depositAccount.number,
      contAmount: closeInfo.total,
      contRate: 1,
      contCurCode: depositAccount.currency,
      txnDesc: closeData.description,
      sourceType: 'OI',
      isPreview: 0,
      isPreviewFee: null,
      isTmw: 1,
    },
  ];

  const result = await toPolaris({
    apiUrl: config.apiUrl,
    company: config.company,
    op: '13610267',
    role: config.role,
    token: config.token,
    data: sendData,
  });

  return result;
};
