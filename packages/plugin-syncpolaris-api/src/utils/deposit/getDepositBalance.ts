import { fetchPolaris } from '../utils';

export const getDepositBalance = async (subdomain, params) => {
  const balance = await fetchPolaris({
    op: '13610003',
    data: [params.number],
    subdomain,
  });

  return balance.currentBal;
};
