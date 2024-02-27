import {
  getBranch,
  getCustomer,
  getLoanProduct,
  getUser,
  fetchPolaris,
  updateLoanNumber,
  customFieldToObject,
  getFullDate,
} from '../utils';
import { activeLoan } from './activeLoan';
import { createSavingLoan } from './createSavingLoan';

export const createLoan = async (subdomain, params) => {
  const loan = params.updatedDocument || params.object;

  if (loan.leaseType === 'saving')
    return await createSavingLoan(subdomain, params);

  const loanData = await customFieldToObject(subdomain, 'loans:contract', loan);

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
    purpose: loanData.purpose,
    subPurpose: loanData.subPurpose,
    isNotAutoClass: 0,
    comRevolving: 0,
    dailyBasisCode: 'ACTUAL/365',
    curCode: loanData.currency,
    approvAmount: loanData.leaseAmount,
    impairmentPer: 0,
    approvDate: getFullDate(loanData.startDate),
    acntManager: leasingExpert.employeeId,
    brchCode: branch.code,
    startDate: getFullDate(loanData.startDate),
    endDate: getFullDate(loanData.endDate),
    termLen: loanData.tenor,
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

  const result = await fetchPolaris({
    op: '13610253',
    data: [sendData],
    subdomain,
  }).then((a) => JSON.parse(a));

  if (typeof result === 'string') {
    await updateLoanNumber(subdomain, loan._id, result);
    await activeLoan(subdomain, [result, 'данс нээв', null]);
  }

  return result;
};
