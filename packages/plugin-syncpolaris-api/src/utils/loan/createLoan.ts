import {
  getBranch,
  getCustomer,
  getLoanProduct,
  getUser,
  fetchPolaris,
  updateLoanNumber,
} from '../utils';
import { createLoanSchedule } from './createSchedule';

export const createLoan = async (subdomain, params) => {
  const loan = params.updatedDocument || params.object;

  const customer = await getCustomer(subdomain, loan.customerId);

  const loanProduct = await getLoanProduct(subdomain, loan.contractTypeId);

  const leasingExpert = await getUser(subdomain, loan.leasingExpertId);

  const branch = await getBranch(subdomain, loan.branchId);

  let sendData: any = {
    custCode: customer.code,
    name: `${customer.code} ${customer.firstName} ${customer.code} ${customer.lastName}`,
    name2: `${customer.code} ${customer.firstName} ${customer.code} ${customer.lastName}`,
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
  };

  console.log('sendData', sendData);

  const result = await fetchPolaris({
    op: '13610313',
    data: [sendData],
    subdomain,
  });

  console.log('result', result);

  if (typeof result === 'string') {
    await updateLoanNumber(subdomain, loan._id, result);
    loan.number = result;
    await createLoanSchedule(subdomain, sendData);
  }
  return result;
};
