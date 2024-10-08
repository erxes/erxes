import { fetchPolaris } from '../utils';
import { IPolarisStoreInterest } from './types';

export const createLoanStoreInterest = async (subdomain, polarisConfig, storeInterest) => {
  const loanStoreInterest: IPolarisStoreInterest = {
    txnAcntCode: storeInterest.number,
    txnAmount: storeInterest.amount,
    txnDesc: storeInterest.description,
    sourceType: 'TLLR',
    offBal: 1,
    isPreview: 0,
    isTmw: 1,
    intTypeCodeAdj: 'SIMPLE_INT',
  };

  const loanGiveReponse = await fetchPolaris({
    subdomain,
    op: '13610257',
    data: [loanStoreInterest],
    polarisConfig,
  });

  return loanGiveReponse.txnJrno;
};
