import { generateModels } from '../../connectionResolver';
import {
  getBranch,
  getUser,
  fetchPolaris,
  getFullDate,
  updateContract,
  sendMessageBrokerData,
  getProduct,
  getPurpose
} from '../utils';
import { createSavingLoan } from './createSavingLoan';
import { IPolarisLoan } from './types';
import { updateLoan } from './updateLoan';
import { validateLoanObject } from './validator';

export const createLoanMessage = async (subdomain, polarisConfig, loan) => {
  let result;

  if (
    !polarisConfig ||
    !polarisConfig.apiUrl ||
    !polarisConfig.token ||
    !polarisConfig.companyCode ||
    !polarisConfig.role
  ) {
    return;
  }

  const models = await generateModels(subdomain);

  const syncLogDoc = {
    type: '',
    contentType: 'loans:contract',
    contentId: loan._id,
    createdAt: new Date(),
    createdBy: '',
    consumeData: loan,
    consumeStr: JSON.stringify(loan)
  };

  const preSuccessValue = await models.SyncLogs.findOne({
    contentType: 'loans:contract',
    contentId: loan._id,
    error: { $exists: false },
    responseData: { $exists: true, $ne: null }
  }).sort({ createdAt: -1 });

  let syncLog = await models.SyncLogs.syncLogsAdd(syncLogDoc);

  if (preSuccessValue) {
    return await updateLoan(subdomain, models, polarisConfig, syncLog, loan);
  }

  if (loan.leaseType === 'saving')
    return await createSavingLoan(subdomain, polarisConfig, loan);

  const customer = await sendMessageBrokerData(
    subdomain,
    'core',
    'customers.findOne',
    { _id: loan.customerId }
  );

  const loanProduct = await getProduct(subdomain, loan.contractTypeId, 'loans');

  const leasingExpert = await getUser(subdomain, loan.leasingExpertId);

  const branch = await getBranch(subdomain, loan.branchId);

  const purpose = await getPurpose(subdomain, loan.loanDestination, 'loans');

  const subPurpose = await getPurpose(subdomain, loan.loanPurpose, 'loans');

  let sendData: IPolarisLoan = {
    custCode: customer.code,
    name: `${customer.firstName} ${customer.lastName}`,
    name2: `${customer.firstName} ${customer.lastName}`,
    prodCode: loanProduct?.code,
    prodType: 'LOAN',
    purpose: purpose ? purpose.code : '',
    subPurpose: subPurpose ? subPurpose.code : '',
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
    secType: 0
  };

  await validateLoanObject(sendData);

  if (!preSuccessValue) {
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
        syncLog
      });
    }

    if (typeof result === 'string') {
      await updateContract(
        subdomain,
        { _id: loan._id },
        { $set: { number: result, isSyncedPolaris: true } },
        'loans'
      );
    }
  }

  return result;
};
