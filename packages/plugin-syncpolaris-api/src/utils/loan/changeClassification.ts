import { fetchPolaris, getClassificationCode, getContract } from '../utils';
import { IPolarisClassification } from './types';

export const createChangeClassification = async (subdomain, classification) => {
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
  }).then((response) => JSON.parse(response));

  return loanChangeClassificationReponse.txnJrno;
};
