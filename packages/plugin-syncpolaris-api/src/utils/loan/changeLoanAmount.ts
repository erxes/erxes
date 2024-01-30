import { fetchPolaris, getClassificationCode, getLoanContract } from '../utils';
import { IPolarisClassification } from './types';

export const createChangeLoanAmount = async (subdomain, params) => {
  const loanContract = await getLoanContract(subdomain, params.contractId);

  const sendData = [
    {},
    loanContract.number,
    params.leaseAmount,
    params.description,
    null,
  ];

  const loanChangeLoanAmountResponse = await fetchPolaris({
    subdomain,
    op: '13611117',
    data: sendData,
  }).then((response) => JSON.parse(response));

  return loanChangeLoanAmountResponse.txnJrno;
};
