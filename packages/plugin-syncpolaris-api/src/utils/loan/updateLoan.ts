import {
  getBranch,
  getCustomer,
  getUser,
  fetchPolaris,
  getProduct,
  getFullDate,
} from '../utils';

export const updateLoan = async (
  subdomain,
  models,
  polarisConfig,
  syncLog,
  params
) => {
  const loan = params.data;
  const customer = await getCustomer(subdomain, loan.customerId);

  const loanProduct = await getProduct(subdomain, loan.contractTypeId, 'loans');

  const leasingExpert = await getUser(subdomain, loan.leasingExpertId);

  const branch = await getBranch(subdomain, loan.branchId);

  let sendData = [
    {},
    {
      acntCode: loan.number,
      custCode: customer.code,
      name: `${customer.firstName} ${customer.lastName}`,
      name2: `${customer.firstName} ${customer.lastName}`,
      prodCode: loanProduct?.code,
      prodType: 'LOAN',
      purpose: loan.loanDestination,
      subPurpose: loan.loanPurpose,
      isNotAutoClass: 0,
      comRevolving: 0,
      dailyBasisCode: 'ACTUAL/365',
      curCode: loan.currency,
      approvAmount: loan.leaseAmount,
      impairmentPer: 0,
      approvDate: getFullDate(loan.startDate),
      acntManager: leasingExpert?.employeeId,
      brchCode: branch?.code,
      startDate: getFullDate(loan.startDate),
      endDate: getFullDate(loan.endDate),
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

  if (
    loanProduct?.code &&
    loan.loanDestination != null &&
    loan.loanPurpose != null &&
    loan.leaseAmount !== 0 &&
    leasingExpert?.employeeId != null &&
    branch?.code != null &&
    loan.tenor !== 0
  ) {
    await fetchPolaris({
      op: '13610282',
      data: sendData,
      subdomain,
      models,
      polarisConfig,
      syncLog,
    });
  }
};
