import { createCollateral } from '../collateral/createCollateral';
import {
  getBranch,
  getCustomer,
  getUser,
  fetchPolaris,
  updateContract,
  getProduct,
  genObjectOfRule,
  customFieldToObject,
  getFullDate,
} from '../utils';
import { createChangeLoanAmount } from './changeLoanAmount';
import { changeLoanInterest } from './changeLoanInterest';

export const updateLoan = async (subdomain, models, polarisConfig, syncLog, params) => {
  const loan = params.updatedDocument || params.object;
  const loanData = await customFieldToObject(subdomain, 'loans:contract', loan);

  if (JSON.stringify(loan.collateralsData) !== JSON.stringify(params.object.collateralsData)) {
    return createCollateral(subdomain, polarisConfig, loan)
  }

  if (params.updatedDocument.leaseAmount !== params.object.leaseAmount) {
    return createChangeLoanAmount(subdomain, polarisConfig, {
      number: loan.number,
      leaseAmount:
        params.updatedDocument.leaseAmount - params.object.leaseAmount,
      description: `change loan amount ${params.updatedDocument.description}`,
    });
  }

  if (params.updatedDocument.interestRate !== params.object.interestRate) {
    return changeLoanInterest(subdomain, polarisConfig, params.updatedDocument);
  }

  const customer = await getCustomer(subdomain, loan.customerId);

  const loanProduct = await getProduct(subdomain, loan.contractTypeId, 'loans');

  const leasingExpert = await getUser(subdomain, loan.leasingExpertId);

  const branch = await getBranch(subdomain, loan.branchId);

  const dataOfRules = await genObjectOfRule(
    subdomain,
    "loans:contract",
    loan,
    (polarisConfig.loan && polarisConfig.loan[loan.contractTypeId || ''] || {}).values || {}
  );


  let sendData = [
    {
      acntCode: loanData.number,
      custCode: customer.code,
      name: `${customer.code} ${customer.firstName} ${customer.code} ${customer.lastName}`,
      name2: `${customer.code} ${customer.firstName} ${customer.code} ${customer.lastName}`,
      prodCode: loanProduct?.code,
      prodType: 'LOAN',
      purpose: loanData.purpose,
      subPurpose: loanData.subPurpose,
      isNotAutoClass: 0,
      comRevolving: 0,
      dailyBasisCode: 'ACTUAL/365',
      curCode: loanData.currency,
      approvAmount: loanData.leaseAmount,
      impairmentPer: 0,
      approvDate: getFullDate(loanData.startDate),
      acntManager: leasingExpert?.employeeId,
      brchCode: branch?.code,
      startDate: getFullDate(loanData.startDate),
      endDate: getFullDate(loanData.endDate),
      termLen: loanData.tenor,
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
      secType: 0,

      "prodName": "БИЗНЕСИЙН ЗЭЭЛ",
      "brchName": "ТӨВ САЛБАР - ЭЦЭГ САЛБАР",
      "flagMoveSa": "0",
      "repayAcntCode": "MN143400100022000028",
      "repayAcntSysNo": 1305,
      "dynamicData": [
        {
          "companyCode": "STBM",
          "objSubType": "ALL",
          "fieldName": "ЗГ №",
          "objKey": "MN120034110100000048",
          "confirmationNecessary": 0,
          "fieldValueName": "ss",
          "fieldValue": "3r23r",
          "filtered": 0,
          "rn": 3,
          "objType": "LOAN_ACNT",
          "fieldType": 1,
          "isMandatory": 1,
          "fieldId": 1
        },
        {
          "companyCode": "STBM",
          "objSubType": "ALL",
          "fieldName": "ADD DF",
          "objKey": "MN120034110100000048",
          "confirmationNecessary": 0,
          "fieldValueName": "1",
          "fieldValue": 2323,
          "filtered": 0,
          "rn": 4,
          "objType": "LOAN_ACNT",
          "fieldType": 2,
          "isMandatory": 1,
          "fieldId": 3
        },
        {
          "companyCode": "STBM",
          "objSubType": "ALL",
          "fieldName": "PRIVATE FIELD",
          "objKey": "MN120034110100000048",
          "confirmationNecessary": 0,
          "fieldValueName": "ss",
          "fieldValue": "ss",
          "filtered": 0,
          "rn": 1,
          "objType": "LOAN_ACNT",
          "fieldType": 1,
          "isMandatory": 0,
          "fieldId": 2
        },
        {
          "companyCode": "STBM",
          "objSubType": "ALL",
          "fieldName": "ЗЭЭЛ КОМБО",
          "objKey": "MN120034110100000048",
          "confirmationNecessary": 0,
          "fieldValueName": "ss",
          "fieldValue": "ss",
          "filtered": 0,
          "rn": 2,
          "objType": "LOAN_ACNT",
          "fieldType": 1,
          "isMandatory": 1,
          "fieldId": 4
        }
      ],
  
      ...dataOfRules
    },
  ];

  const result = await fetchPolaris({
    op: '13610282',
    data: sendData,
    subdomain,
    models,
    polarisConfig,
    syncLog
  });

  if (typeof result === 'string') {
    await updateContract(
      subdomain,
      { _id: loan._id },
      { $set: { number: result } },
      'loans',
    );
  }
};
