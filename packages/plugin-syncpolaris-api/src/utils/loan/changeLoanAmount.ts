import { fetchPolaris } from '../utils';

export const createChangeLoanAmount = async (subdomain, params) => {
  const sendData = [
    {},
    params.number,
    params.leaseAmount,
    `change loan amount ${params.description}`,
    null,
  ];

  const loanChangeLoanAmountResponse = await fetchPolaris({
    subdomain,
    op: '13611117',
    data: sendData,
  });

  return loanChangeLoanAmountResponse.txnJrno;
};
