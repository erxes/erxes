import {
  customFieldToObject,
  getConfig,
  getCustomer,
  getSavingProduct,
  fetchPolaris,
} from './utils';

export const depositToPolaris = async (subdomain, params) => {
  const config = await getConfig(subdomain, 'POLARIS', {});
  const deposit = params.updatedDocument || params.object;
  let sendData = {};
  const objectCus = await customFieldToObject(
    subdomain,
    'savings:contract',
    deposit,
  );
  const savingProduct = await getSavingProduct(
    subdomain,
    deposit.contractTypeId,
  );
  type valueType =
    | 'No'
    | 'Yes'
    | ''
    | 'Тийм'
    | 'Үгүй'
    | 'JOINT'
    | 'SINGLE'
    | 'өөр лүүгээ олгоно'
    | 'өөр CASA данс руу олгоно'
    | 'хугацаат хадгаламж руу олгоно';

  function setValue(value: valueType) {
    switch (value) {
      case 'No':
        return 'N';
      case 'Yes':
        return 'Y';
      case 'Тийм':
        return 1;
      case 'Үгүй':
        return 0;
      case 'JOINT':
        return 'J';
      case 'SINGLE':
        return 'S';
      case 'өөр лүүгээ олгоно':
        return 0;
      case 'өөр CASA данс руу олгоно':
        return 1;
      case 'хугацаат хадгаламж руу олгоно':
        return 2;
      default:
        return '';
    }
  }
  sendData = [
    {
      acntCode: deposit.number,
      acntType: objectCus.acntType,
      prodCode: savingProduct.code,
      brchCode: 'deposit.brchCode',
      curCode: savingProduct.currency,
      custCode: '',
      name: deposit.number,
      name2: deposit.number,
      slevel: objectCus.slevel,
      statusCustom: '',
      jointOrSingle: setValue(objectCus.jointOrSingle),
      dormancyDate: objectCus.dormancyDate,
      statusDate: objectCus.statusDate,
      flagNoCredit: setValue(objectCus.flagNoCredit),
      flagNoDebit: setValue(objectCus.flagNoCredit),
      salaryAcnt: setValue(objectCus.salaryAcnt),
      corporateAcnt: setValue(objectCus.corporateAcnt),
      capAcntCode: objectCus.capAcntCode,
      capMethod: setValue(objectCus.capMethod),
      segCode: objectCus.segCode,
      paymtDefault: setValue(objectCus.paymtDefault),
      odType: objectCus.odType,
    },
  ];
  console.log('objectCus:', objectCus);
  console.log('sendData:', sendData);
  fetchPolaris({
    op: '13610020',
    data: sendData,
    subdomain,
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
      count: acntTransactionParams.count,
    },
  ];
  fetchPolaris({
    op: '13610003',
    data: sendData,
    subdomain,
  });
};

export const getCustomerAcntBalance = async (subdomain, params) => {
  const config = await getConfig(subdomain, 'POLARIS', {});
  const acntBalanceParam = params.updatedDocument || params.object;
  let sendData = {};

  sendData = [
    {
      acntCode: acntBalanceParam.acntCode,
    },
  ];
  fetchPolaris({
    op: '13610003',
    data: sendData,
    subdomain,
  });
};
