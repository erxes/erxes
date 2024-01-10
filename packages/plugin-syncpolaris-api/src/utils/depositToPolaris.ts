import { getConfig, toPolaris } from './utils';

export const depositToPolaris = async (subdomain, params) => {
  const config = await getConfig(subdomain, 'POLARIS', {});

  const deposit = params.updatedDocument || params.object;
  let sendData = {};

  sendData = [
    {
      acntType: deposit.acntType,
      prodCode: deposit.prodCode,
      brchCode: deposit.brchCode,
      curCode: deposit.curCode,
      custCode: deposit.custCode,
      name: deposit.name,
      name2: deposit.name2,
      slevel: deposit.slevel,
      statusCustom: deposit.statusCustom,
      jointOrSingle: deposit.jointOrSingle,
      dormancyDate: deposit.dormancyDate,
      statusDate: deposit.status,
      flagNoCredit: deposit.flagNoCredit,
      flagNoDebit: deposit.flagNoDebit,
      salaryAcnt: deposit.salaryAcnt,
      corporateAcnt: deposit.corporateAcnt,
      capAcntCode: deposit.capAcntCode,
      capMethod: deposit.capMethod,
      segCode: deposit.segCode,
      paymtDefault: deposit.paymtDefault,
      odType: deposit.odType
    }
  ];

  toPolaris({
    apiUrl: config.apiUrl,
    company: config.company,
    op: '13610020',
    role: config.role,
    token: config.token,
    data: sendData
  });
};

export const getCustomerAcntTransaction = async (subdomain, params) => {
  const config = await getConfig(subdomain, 'POLARIS', {});
  const acntTransactionParams = params.updatedDocument || params.object;
  let sendData = {};

  sendData = [
    {
      acntCode: acntTransactionParams.acntCode,
      startDate: acntTransactionParams.startDate,
      endDate: acntTransactionParams.endDate,
      orderBy: acntTransactionParams.orderBy,
      seeNotFinancial: acntTransactionParams.seeNotFinancial,
      seeCorr: acntTransactionParams.seeCorr,
      seeReverse: acntTransactionParams.seeReverse,
      startPosition: acntTransactionParams.startPosition,
      count: acntTransactionParams.count
    }
  ];
  toPolaris({
    apiUrl: config.apiUrl,
    company: config.company,
    op: '13610003',
    role: config.role,
    token: config.token,
    data: sendData
  });
};

export const getCustomerAcntBalance = async (subdomain, params) => {
  const config = await getConfig(subdomain, 'POLARIS', {});
  const acntBalanceParam = params.updatedDocument || params.object;
  let sendData = {};

  sendData = [
    {
      acntCode: acntBalanceParam.acntCode
    }
  ];
  toPolaris({
    apiUrl: config.apiUrl,
    company: config.company,
    op: '13610003',
    role: config.role,
    token: config.token,
    data: sendData
  });
};
