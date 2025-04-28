import {
  getCustomer,
  fetchPolaris,
  getBranch,
  sendMessageBrokerData,
} from '../utils';

export const updateSaving = async (
  subdomain: string,
  models,
  polarisConfig,
  syncLog,
  params,
  user
) => {
  const savingContract = params.updatedDocument || params.object;
  let updateData;

  const savingProduct = await sendMessageBrokerData(
    subdomain,
    'savings',
    'contractType.findOne',
    { _id: savingContract.contractTypeId }
  );

  const customer = await getCustomer(subdomain, savingContract.customerId);

  const branch = await getBranch(subdomain, savingContract.branchId);

  let sendData = {
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
    startDate: savingContract?.startDate,
    maturityDate: '',
    tenor: savingContract.duration,
    capMethod: '0',
    rcvAcntCode:
      savingContract.depositAccount === 'depositAccount'
        ? savingContract.depositAccount
        : '',
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
    createdByName: user?.details?.firstName,
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
    repayPriority: 0,
  };

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
      syncLog,
    });
  }

  return updateData;
};
