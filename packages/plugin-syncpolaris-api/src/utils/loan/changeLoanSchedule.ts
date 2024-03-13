import { fetchPolaris, getContract } from '../utils';

export const changeLoanSchedule = async (subdomain, params) => {
  const loanContract = await getContract(subdomain, params.contractId, 'loans');

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
