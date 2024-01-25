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

export const createLoan = async (subdomain, params) => {
  const loan = params.updatedDocument || params.object;

  const customer = await getCustomer(subdomain, loan.customerId);

  const loanProduct = await getLoanProduct(subdomain, loan.contractTypeId);

  const leasingExpert = await getUser(subdomain, loan.leasingExpertId);

  const branch = await getBranch(subdomain, loan.branchId);

  let sendData = [
    {
      custCode: customer.code,
      name: `${customer.code} ${customer.firstName} ${customer.code} ${customer.lastName}`,
      name2: loan.custCode,
      prodCode: loanProduct.code,
      prodType: 'LOAN',
      purpose: loan.purpose ?? 'PURP00000022',
      subPurpose: loan.subPurpose ?? 'SUBPURP00070',
      isNotAutoClass: 0,
      comRevolving: 0,
      dailyBasisCode: 'ACTUAL/365',
      curCode: loan.currency,
      approvAmount: loan.leaseAmount,
      impairmentPer: 0,
      approvDate: loan.startDate,
      acntManager: leasingExpert.employeeId,
      brchCode: branch.code,
      startDate: loan.startDate,
      endDate: loan.endDate,
      termLen: loan.tenor,

      IsGetBrchFromOutside: '0',
      segCode: '1',
      status: 'N',
      slevel: '1',
      classNoTrm: '1',
      classNoQlt: '1',
      classNo: '1',
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

  const result = await toPolaris({
    op: '13610313',
    data: sendData,
    subdomain,
  });

  if (typeof result === 'string') {
    await updateLoanNumber(subdomain, loan._id, result);

    await openLoanContract(config, [result, 'данс нээв', null]);
    loan.number = result;
    await createLoanSchedule(config, loan);
  }
};

const openLoanContract = async (subdomain, sendData) => {
  const result = await toPolaris({
    op: '13610263',
    data: sendData,
    subdomain,
  });

  return result;
};
//["acntCode","startDate","calcAmt","payType","payFreq","payMonth","payDay1","payDay2","holidayOption","shiftPartialPay","shiftType","termFreeTimes","intTypeCode","endDate","AdvDate","description","escapeMonths","listNrs","isFixedPayment", "payAmt" ]

const createLoanSchedule = async (subdomain: string, contract: any) => {
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
    op: '13610263',
    data: sendData,
    subdomain,
  });

  return result;
};

const closeContract = async (
  subdomain: string,
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
    op: '13610267',
    data: sendData,
    subdomain,
  });

  return result;
};
