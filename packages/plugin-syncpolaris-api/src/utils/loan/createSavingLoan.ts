import {
  getBranch,
  getCustomer,
  getLoanProduct,
  getUser,
  fetchPolaris,
  updateLoanNumber,
  customFieldToObject,
  getSavingContract,
} from '../utils';
import { activeLoan } from './activeLoan';

export const createLoan = async (subdomain, params) => {
  const loan = params.updatedDocument || params.object;

  const loanData = await customFieldToObject(subdomain, 'loans:contract', loan);

  const customer = await getCustomer(subdomain, loan.customerId);

  const loanProduct = await getLoanProduct(subdomain, loan.contractTypeId);

  const savingContract = await getSavingContract(
    subdomain,
    loan.contractTypeId,
  );

  const leasingExpert = await getUser(subdomain, loan.leasingExpertId);

  const branch = await getBranch(subdomain, loan.branchId);

  let sendData: any = [
    {
      txnAmount: loanData.leaseAmount,
      curCode: loanData.currency,
      rate: 1,
      contAcntCode: '300031000042',
      contAmount: loanData.leaseAmount,
      contCurCode: loanData.currency,
      contRate: 1,
      rateTypeId: '1',
      txnDesc: loanData.description,
      sourceType: 'OI',
      isPreview: 0,
      isPreviewFee: 0,
      isBlockInt: 0,
      collAcnt: {
        name: 'Барьцаа хөрөнгийн нэр',
        name2: 'Барьцаа хөрөнгийн нэр 2дагч хэлээр',
        custCode: customer.code,
        prodCode: savingContract.number,
        prodType: 'COLL',
        collType: '4',
        brchCode: '10',
        status: 'N',
        key2SysNo: '1306',
        key2: '001022000003',
        price: loanData.leaseAmount,
        curCode: savingContract.currency,
      },
      loanAcnt: {
        custCode: customer.code,
        name: `${customer.code} ${customer.firstName}`,
        name2: `${customer.code} ${customer.firstName}`,
        prodCode: loanProduct.code,
        curCode: loanData.currency,
        approvAmount: loanData.leaseAmount,
        approvDate: loanData.startDate,
        startDate: loanData.startDate,
        termLen: 6,
        endDate: loanData.endDate,
        purpose: loanData.purpose,
        subPurpose: loanData.subPurpose,
        isNotAutoClass: 0,
        comRevolving: 0,
        dailyBasisCode: 'ACTUAL/360',
        acntManager: leasingExpert.code,
        brchCode: branch.code,
        isGetBrchFromOutside: 1,
        segCode: customer.segCode,
        status: loanData.status,
        slevel: loanData.slevel,
        classNoTrm: 1,
        classNoQlt: 1,
        classNo: 1,
        repayAcntCode: null,
        isBrowseAcntOtherCom: 0,
        repayPriority: 0,
        losMultiAcnt: 0,
        impairmentPer: 0,
        validLosAcnt: 1,
        prodType: 'LOAN',
        secType: 0,
        dynamicData: [
          {
            objType: 'LOAN_ACNT',
            fieldId: 85,
            fieldValue: 1,
          },
        ],
      },
      acntNrs: {
        startDate: loanData.startDate,
        calcAmt: loanData.leaseAmount,
        payType: '1',
        payFreq: 'M',
        payDay1: loanData.scheduleDays?.[0],
        payDay2: loanData.scheduleDays?.[1] ?? null,
        holidayOption: '2',
        shiftPartialPay: 0,
        termFreeTimes: 0,
        intTypeCode: 'SIMPLE_INT',
        endDate: loanData.endDate,
      },
      acntInt: {
        intTypeCode: 'SIMPLE_INT',
        intRate: loanData.interestRate,
      },
    },
  ];

  const result = await fetchPolaris({
    op: '13610265',
    data: [sendData],
    subdomain,
  }).then((a) => JSON.parse(a));

  if (typeof result === 'string') {
    await updateLoanNumber(subdomain, loan._id, result);
  }

  return result;
};
