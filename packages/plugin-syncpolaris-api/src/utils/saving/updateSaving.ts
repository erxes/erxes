import {
  getCustomer,
  fetchPolaris,
  getBranch,
  sendMessageBrokerData
} from '../utils';
import { getDate } from './getDate';
import { IPolarisUpdateSaving } from './types';
import { validateUpdateSavingObject } from './validator';

export const updateSaving = async (
  subdomain: string,
  models,
  polarisConfig,
  syncLog,
  savingContract,
  user
) => {
  let updateData;

  const savingProduct = await sendMessageBrokerData(
    subdomain,
    'savings',
    'contractType.findOne',
    { _id: savingContract.contractTypeId }
  );

  const deposit = await sendMessageBrokerData(
    subdomain,
    'savings',
    'contracts.findOne',
    { _id: savingContract.depositAccount }
  );

  const customer = await getCustomer(subdomain, savingContract.customerId);

  const branch = await getBranch(subdomain, savingContract.branchId);

  const getAccounts = await fetchPolaris({
    op: '13610312',
    data: [customer?.code, 0, 20],
    subdomain,
    polarisConfig
  });

  const customerAccount = getAccounts.filter(
    (account) => account.acntType === 'CA'
  );

  const systemDate = await getDate(subdomain, polarisConfig);

  const endDate = new Date(systemDate).setMonth(
    new Date(systemDate).getMonth() + savingContract.duration
  );

  const depositNumber = deposit?.number || '';
  const polarisNumber =
    customerAccount && customerAccount.length > 0
      ? customerAccount[0].acntCode
      : '';

  let sendData: IPolarisUpdateSaving = {
    operCode: '13610286',
    acntCode: savingContract.number,
    name: `${customer.firstName} ${customer.lastName}`,
    name2: `${customer.firstName} ${customer.lastName}`,
    companyCode: 'STBM',
    prodCode: savingProduct.code,
    prodType: 'TD',
    brchCode: branch?.code,
    curCode: savingContract.currency,
    custCode: customer?.code,
    statusSys: 'O',
    openDateOrg: savingContract?.startDate,
    startDate: systemDate,
    maturityDate: new Date(endDate),
    tenor: savingContract.duration,
    capMethod: '1',
    rcvAcntCode: depositNumber || polarisNumber || '',
    rcvSysNo: '1305',
    segCode: '81',
    isCorpAcnt: 0,
    jointOrSingle: 'S',
    lastDtDate: '',
    lastCtDate: '',
    slevel: 1,
    createdBy: 10,
    createdDate: new Date(),
    createdDatetime: new Date(),
    createdByName: user?.details?.firstName || '',
    modifiedBy: 1,
    modifiedDate: new Date(),
    modifiedDatetime: new Date(),
    modifiedByName: 'СИСТЕМ BFGB',
    lastSeqTxn: 54,
    termBasis: 'D',
    termLen: savingContract.duration,
    passbookFacility: 1,
    classNo: 1,
    maturityOption: 'R',
    readBal: 1,
    readDetail: 1,
    readTran: 1,
    doTran: 1,
    useSpclAcnt: 0,
    jointOrSingleStr: '0',
    repayPriority: 0
  };

  await validateUpdateSavingObject(sendData);

  if (
    savingProduct?.code &&
    savingProduct.name != null &&
    savingContract.duration != null &&
    customer?.code != null &&
    branch?.code != null
  ) {
    updateData = await fetchPolaris({
      op: '13610286',
      data: [{}, sendData],
      subdomain,
      models,
      polarisConfig,
      syncLog
    });
  }

  return updateData;
};
