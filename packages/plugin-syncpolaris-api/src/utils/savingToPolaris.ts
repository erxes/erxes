import { getCustomer, fetchPolaris } from './utils';

export const savingToPolaris = async (subdomain: string, params) => {
  const savingContract = params.object;

  const customer = await getCustomer(subdomain, savingContract.customerId);

  let sendData = {};
  sendData = [
    {
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
    },
  ];

  fetchPolaris({
    op: '13610120',
    data: sendData,
    subdomain,
  });
};

export const getSavingAcntTransaction = async (subdomain, params) => {
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
  fetchPolaris({
    op: '13610101',
    data: sendData,
    subdomain,
  });
};
