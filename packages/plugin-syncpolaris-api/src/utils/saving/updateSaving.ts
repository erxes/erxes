import { getCustomer, fetchPolaris, genObjectOfRule } from '../utils';

export const updateSaving = async (subdomain: string, models, polarisConfig, syncLog, params) => {
  const savingContract = params.object;
  const customer = await getCustomer(subdomain, savingContract.customerId);

  const dataOfRules = await genObjectOfRule(
    subdomain,
    "savings:contract",
    savingContract,
    (polarisConfig.saving && polarisConfig.saving[savingContract.contractTypeId || ''] || {}).values || {}
  )

  let sendData = {
    prodCode: savingContract.contractTypeId,
    slevel: 1,
    capMethod: savingContract.interestCalcType,
    capAcntCode:
      savingContract.depositAccount === 'depositAccount'
        ? savingContract.depositAccount
        : '',
    capAcntSysNo: '', // savingContract.storeInterestInterval,
    startDate: savingContract.startDate,
    maturityOption: savingContract.closeOrExtendConfig,
    rcvAcntCode:
      savingContract.depositAccount === 'depositAccount'
        ? savingContract.depositAccount
        : '',
    brchCode: savingContract.branchId,
    curCode: savingContract.currency,
    name: savingContract.contractType.name,
    name2: savingContract.contractType.__typename,
    termLen: savingContract.duration,
    maturityDate: savingContract.endDate,
    custCode: customer.code,
    segCode: savingContract.number,
    jointOrSingle: 's',
    statusCustom: 0,
    statusDate: savingContract.startDate,
    casaAcntCode: savingContract.casaAcntCode,
    closedBy: savingContract.closedBy,
    closedDate: savingContract.closedDate,
    lastCtDate: savingContract.lastCtDate,
    lastDtDate: savingContract.lastDtDate,
    ...dataOfRules
  };

  return await fetchPolaris({
    op: '13610120',
    data: [sendData],
    subdomain,
    models,
    polarisConfig,
    syncLog
  });
};

export const getSavingAcntTransaction = async (subdomain, models, polarisConfig, syncLog, params) => {
  const savingTransactionParams = params.updatedDocument || params.object;
  let sendData = {};

  sendData = [
    {
      acntCode: savingTransactionParams.acntCode,
      startDate: savingTransactionParams.startDate,
      endDate: savingTransactionParams.endDate,
      orderBy: savingTransactionParams.orderBy,
      seeNotFinancial: savingTransactionParams.seeNotFinancial,
      seeCorr: savingTransactionParams.seeCorr,
      seeReverse: savingTransactionParams.seeReverse,
      startPagingPosition: savingTransactionParams.startPagingPosition,
      PageRowCount: savingTransactionParams.PageRowCount,
    },
  ];

  return await fetchPolaris({
    op: '13610101',
    data: sendData,
    subdomain,
    models,
    polarisConfig,
    syncLog
  });
};
