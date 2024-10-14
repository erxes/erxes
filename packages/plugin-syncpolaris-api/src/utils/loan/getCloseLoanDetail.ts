import { fetchPolaris, getClassificationCode, getContract } from '../utils';
import { IPolarisClassification } from './types';

export const getCloseLoanDetail = async (subdomain, polarisConfig, classification) => {
  const loanContract = await getContract(
    subdomain,
    classification.contractId,
    'loans',
  );

  const loanChangeClassification: IPolarisClassification = {
    operCode: '13610279',
    txnAcntCode: loanContract.number,
    newValue: getClassificationCode(classification.newClassification),
    txnDesc: classification.description,
    sourceType: 'OI',
    identityType: '',
  };

  const loanChangeClassificationReponse = await fetchPolaris({
    subdomain,
    op: '13610279',
    data: [loanChangeClassification],
    polarisConfig
  });

  return loanChangeClassificationReponse.txnJrno;
};
