import { fetchPolaris } from '../utils';

export const getDepositBalance = async (subdomain, polarisConfig, params) => {
  const balance = await fetchPolaris({
    op: '13610003',
    data: [params.number],
    subdomain,
    polarisConfig,
  });

  return balance.currentBal;
};
