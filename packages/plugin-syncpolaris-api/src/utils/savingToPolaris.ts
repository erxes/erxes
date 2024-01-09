import { getConfig, toPolaris } from './utils';

export const savingToPolaris = async (subdomain, params) => {
  const config = await getConfig(subdomain, 'POLARIS', {});

  const savingParams = params.object;
  let sendData = {};
  sendData = [
    {
      prodCode: savingParams.prodCode, //
      slevel: 1,
      capMethod: savingParams.interestCalcType,
      capAcntCode: savingParams.depositAccount,
      capAcntSysNo: savingParams.storeInterestInterval,
      startDate: savingParams.startDate,
      maturityOption: savingParams.closeOrExtendConfig,
      rcvAcntCode: savingParams.interestGiveType,
      brchCode: savingParams.branchId,
      curCode: savingParams.currency,
      name: savingParams.name, //
      name2: savingParams.name2, //
      termLen: savingParams.duration,
      maturityDate: savingParams.endDate,
      custCode: savingParams.customerId,
      segCode: savingParams.number,
      jointOrSingle: 's',
      statusCustom: 0,
      statusDate: savingParams.startDate,
      casaAcntCode: savingParams.casaAcntCode, //
      closedBy: savingParams.closedBy, //
      closedDate: savingParams.closedDate, //
      lastCtDate: savingParams.lastCtDate, //
      lastDtDate: savingParams.lastDtDate //
    }
  ];

  toPolaris({
    apiUrl: config.apiUrl,
    company: config.company,
    op: '13610120',
    role: config.role,
    token: config.token,
    data: sendData
  });
};

export const getSavingAcntTransaction = async (subdomain, params) => {
  const config = await getConfig(subdomain, 'POLARIS', {});
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
      PageRowCount: savingTransactionParams.PageRowCount
    }
  ];
  toPolaris({
    apiUrl: config.apiUrl,
    company: config.company,
    op: '13610101',
    role: config.role,
    token: config.token,
    data: sendData
  });
};
