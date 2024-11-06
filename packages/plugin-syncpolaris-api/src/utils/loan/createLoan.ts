import {
  getBranch,
  getUser,
  fetchPolaris,
  customFieldToObject,
  getFullDate,
  updateContract,
  sendMessageBrokerData,
  genObjectOfRule,
  getProduct,
} from '../utils';
import { activeLoan } from './activeLoan';
import { createSavingLoan } from './createSavingLoan';

export const createLoan = async (subdomain, models, polarisConfig, syncLog, params) => {
  const loan = params.updatedDocument || params.object;

  if (loan.leaseType === 'saving')
    return await createSavingLoan(subdomain, polarisConfig, params);

  const loanData = await customFieldToObject(subdomain, "loans:contract", loan);

  const customer = await sendMessageBrokerData(
    subdomain,
    "core",
    "customers.findOne",
    { _id: loan.customerId }
  );

  const loanProduct = await getProduct(subdomain, loan.contractTypeId, 'loans');

  const leasingExpert = await getUser(subdomain, loan.leasingExpertId);

  const branch = await getBranch(subdomain, loan.branchId);

  const dataOfRules = await genObjectOfRule(
    subdomain,
    "loans:contract",
    loan,
    (polarisConfig.loan && polarisConfig.loan[loan.contractTypeId || ''] || {}).values || {}
  );

  let sendData: any = {
    custCode: customer.code,
    name: `${customer.code} ${customer.firstName} ${customer.code} ${customer.lastName}`,
    name2: `${customer.code} ${customer.firstName} ${customer.code} ${customer.lastName}`,
    prodCode: loanProduct?.code,
    prodType: "LOAN",
    purpose: loanData.purpose,
    subPurpose: loanData.subPurpose,
    isNotAutoClass: 0,
    comRevolving: 0,
    dailyBasisCode: "ACTUAL/365",
    curCode: loanData.currency,
    approvAmount: loanData.leaseAmount,
    impairmentPer: 0,
    approvDate: getFullDate(loanData.startDate),
    acntManager: leasingExpert?.employeeId,
    brchCode: branch?.code,
    startDate: getFullDate(loanData.startDate),
    endDate: getFullDate(loanData.endDate),
    termLen: loanData.tenor,
    IsGetBrchFromOutside: "0",
    segCode: "1",
    status: "N",
    slevel: "1",
    classNoTrm: "1",
    classNoQlt: "1",
    classNo: "1",
    termBasis: "M",
    isBrowseAcntOtherCom: 0,
    repayPriority: 0,
    useSpclAcnt: 0,
    notSendToCib: 0,
    losMultiAcnt: 0,
    validLosAcnt: 1,
    secType: 0,
    ...dataOfRules
  };

  const result = await fetchPolaris({
    op: "13610253",
    data: [sendData],
    subdomain,
    models,
    polarisConfig,
    syncLog
  });

  if (typeof result === "string") {
    await updateContract(
      subdomain,
      { _id: loan._id },
      { $set: { number: result } },
      "loans"
    );
    await activeLoan(subdomain, polarisConfig, [result, 'данс нээв', null]);
  }

  return result;
};
