import {
  getBranch,
  getUser,
  fetchPolaris,
  getFullDate,
  updateContract,
  sendMessageBrokerData,
  getProduct,
} from '../utils';
import { activeLoan } from './activeLoan';
import { createSavingLoan } from './createSavingLoan';

export const createLoan = async (
  subdomain,
  models,
  polarisConfig,
  syncLog,
  params
) => {
  const loan = params.updatedDocument || params.object;
  let result;

  if (loan.leaseType === 'saving')
    return await createSavingLoan(subdomain, polarisConfig, params);

  const customer = await sendMessageBrokerData(
    subdomain,
    'core',
    'customers.findOne',
    { _id: loan.customerId }
  );

  const loanProduct = await getProduct(subdomain, loan.contractTypeId, 'loans');

  const leasingExpert = await getUser(subdomain, loan.leasingExpertId);

  const branch = await getBranch(subdomain, loan.branchId);

  let sendData: any = {
    custCode: customer.code,
    name: `${customer.code} ${customer.firstName} ${customer.code} ${customer.lastName}`,
    name2: `${customer.code} ${customer.firstName} ${customer.code} ${customer.lastName}`,
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
  };

  if (
    loanProduct?.code &&
    loan.loanDestination != null &&
    loan.loanPurpose != null &&
    loan.leaseAmount !== 0 &&
    leasingExpert?.employeeId != null &&
    branch?.code != null &&
    loan.tenor !== 0
  ) {
    result = await fetchPolaris({
      op: '13610253',
      data: [sendData],
      subdomain,
      models,
      polarisConfig,
      syncLog,
    });
  }

  if (typeof result === 'string') {
    await updateContract(
      subdomain,
      { _id: loan._id },
      { $set: { number: result } },
      'loans'
    );
    await activeLoan(subdomain, polarisConfig, [result, 'данс нээв', null]);
  }

  return 'result';
};
