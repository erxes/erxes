import { fetchPolaris } from '../utils';

export const changeLoanInterest = async (subdomain, polarisConfig, params) => {
  const sendData = {
    txnAcntCode: params.number,
    txnDesc: `change interest ${params.description}`,
    isPreview: {
      isTrusted: true,
    },
    isPreviewFee: null,
    isTmw: 1,
    addParams: [
      {
        INTTYPECODE: 'SIMPLE_INT',
        NEWINTRATEOPTION: 'FIXED',
        NEWINTRATE: params.interestRate,
      },
    ],
  };

  const loanChangeLoanAmountResponse = await fetchPolaris({
    subdomain,
    op: '13610252',
    data: [sendData],
    polarisConfig
  });

  return loanChangeLoanAmountResponse.txnJrno;
};
