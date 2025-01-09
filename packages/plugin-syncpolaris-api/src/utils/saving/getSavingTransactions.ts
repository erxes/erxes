import { fetchPolaris } from '../utils';

export const getSavingTransactions = async (subdomain, polarisConfig, params) => {
  let sendData = [params.number, params.startDate, params.endDate, 0, 100];

  return await fetchPolaris({
    op: '13610101',
    data: sendData,
    subdomain,
    polarisConfig,
  });
};
