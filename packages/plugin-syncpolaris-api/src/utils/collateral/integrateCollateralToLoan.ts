import {
    fetchPolaris,
  } from '../utils';
  
  export const createDeposit = async (subdomain: string, params) => {
    const data = params.updatedDocument || params.object;
  
    let sendData = {
      "txnAcntCode":data.code,
      "txnAmount":data.amount,
      "contAcntCode":data.code
    }
  
    const depositCode = await fetchPolaris({
      subdomain,
      op: '13610903',
      data: [sendData],
    });
 
    return depositCode;
  };
  