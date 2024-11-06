import { fetchPolaris } from "../utils";

export const integrateCollateralToLoan = async (subdomain: string, polarisConfig, params) => {

  let sendData = {
    txnAcntCode: params.code,
    txnAmount: params.amount,
    contAcntCode: params.loanNumber
  };

  return await fetchPolaris({
    subdomain,
    op: '13610903',
    data: [sendData],
    polarisConfig
  });

};
