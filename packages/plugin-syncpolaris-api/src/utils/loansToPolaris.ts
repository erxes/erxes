import { getConfig, toPolaris } from './utils';

export const loansToPolaris = async (
  subdomain,
  params,
  action: 'create' | 'update'
) => {
  const config = await getConfig(subdomain, 'POLARIS', {});

  const loan = params.updatedDocument || params.object;

  let sendData = [
    {
      custCode: loan.custCode,
      name: loan.custCode,
      name2: loan.custCode,
      prodCode: loan.prodCode,
      prodType: loan.prodType,
      purpose: loan.purpose,
      subPurpose: loan.subPurpose,
      isNotAutoClass: loan.isNotAutoClass,
      comRevolving: loan.comRevolving,
      dailyBasisCode: loan.dailyBasisCode,
      curCode: loan.curCode,
      approvAmount: loan.approvAmount,
      impairmentPer: loan.impairmentPer,
      approvDate: loan.approvDate,
      acntManager: loan.acntManager,
      brchCode: loan.brchCode,
      IsGetBrchFromOutside: loan.IsGetBrchFromOutside,
      segCode: loan.segCode,
      status: loan.status,
      slevel: loan.slevel,
      classNoTrm: loan.classNoTrm,
      classNoQlt: loan.classNoQlt,
      classNo: loan.classNo,
      startDate: loan.startDate,
      endDate: loan.endDate,
      termLen: loan.termLen,
      termBasis: loan.termBasis,
      isBrowseAcntOtherCom: loan.isBrowseAcntOtherCom,
      repayPriority: loan.repayPriority,
      useSpclAcnt: loan.useSpclAcnt,
      notSendToCib: loan.notSendToCib,
      losMultiAcnt: loan.losMultiAcnt,
      validLosAcnt: loan.validLosAcnt,
      secType: loan.secType
    }
  ];

  let op = '';
  if (action === 'create') op = '13610313';
  else if (action === 'update') op = '13610315';

  toPolaris({
    apiUrl: config.apiUrl,
    company: config.company,
    op: op,
    role: config.role,
    token: config.token,
    data: sendData
  });
};
