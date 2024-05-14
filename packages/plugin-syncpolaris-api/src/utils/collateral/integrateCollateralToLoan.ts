import {
    fetchPolaris,
  } from '../utils';
  
  export const integrateCollateralToLoan = async (subdomain: string, params) => {

    let sendData = {
      "txnAcntCode":params.code,
      "txnAmount":params.amount,
      "contAcntCode":params.loanNumber
    }
  
    const depositCode = await fetchPolaris({
      subdomain,
      op: '13610903',
      data: [sendData],
    });
 
    return depositCode;
  };
  