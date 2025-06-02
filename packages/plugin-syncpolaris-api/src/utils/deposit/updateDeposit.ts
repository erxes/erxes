import {
  fetchPolaris,
  getBranch,
  getProduct,
  sendMessageBrokerData
} from '../utils';
import { IPolarisUpdateDeposit } from './types';
import { validateUpdateDepositObject } from './validator';

export const updateDeposit = async (
  subdomain: string,
  models,
  polarisConfig,
  syncLog,
  deposit
) => {
  const savingProduct = await getProduct(
    subdomain,
    deposit.contractTypeId,
    'savings'
  );

  const branch = await getBranch(subdomain, deposit.branchId);

  const customer = await sendMessageBrokerData(
    subdomain,
    'core',
    'customers.findOne',
    { _id: deposit.customerId }
  );

  let sendData: IPolarisUpdateDeposit = {
    corporateAcnt: 'N',
    capAcntSysNo: '1305',
    jointOrSingle: 'S',
    salaryAcnt: '0',
    flagNoDebit: 0,
    flagNoCredit: 0,
    statusProd: 1,
    sysNo: '1305',
    statusSys: 'N',
    slevel: 1,
    capMethod: '0',
    paymtDefault: 0,
    classNoTrm: 1,
    acntCode: deposit.number,
    statusSysName2: 'New',
    readName: 1,
    totalAvailBal: 0,
    lastSeqTxn: 0,
    crntBal: 0,
    prodName: savingProduct.name,
    flagStoppedPayment: 0,
    companyCode: '30',
    acntManagerName: '221',
    acntManager: 131,
    readTran: 1,
    flagFrozen: 0,
    odBal: 0,
    name: `${customer.firstName} ${customer.lastName}`,
    name2: `${customer.firstName} ${customer.lastName}`,
    custType: 1,
    modifiedDate: new Date(),
    flagDormant: 0,
    createdDatetime: new Date(deposit.createdAt),
    odType: 'OD',
    doTran: 1,
    brchCode: branch.code,
    odTypeName: 'Улайлт үүснэ',
    readDetail: 1,
    modifiedDatetime: new Date(),
    flagStopped: 0,
    custName2: `${customer.firstName} ${customer.lastName}`,
    prodName2: savingProduct.name,
    acntType: 'CA',
    modifiedBy: 131,
    curCode: deposit.currency,
    classNoQlt: 1,
    brchName: branch.title,
    dailyBasisCode: 'ACTUAL/364',
    isSecure: 0,
    monthlyWdCount: 0,
    custName: `${customer.firstName} ${customer.lastName}`,
    flagStoppedInt: 0,
    custCode: customer.code,
    availBal: 0,
    prodCode: savingProduct.code,
    readBal: 1,
    createdDate: new Date(deposit.createdAt),
    segCode: '32',
    createdBy: 131,
    statusSysName: 'Шинэ',
    passbookFacility: 0,
    totalBal: 0,
    odClassNo: 1
  };

  await validateUpdateDepositObject(sendData);

  const updateDeposit = await fetchPolaris({
    subdomain,
    op: '13610021',
    data: [sendData],
    models,
    polarisConfig,
    syncLog
  });

  return updateDeposit;
};
