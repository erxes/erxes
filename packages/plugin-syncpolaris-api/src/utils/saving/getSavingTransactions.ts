import { fetchPolaris } from '../utils';

export const getSavingTransactions = async (subdomain, params) => {
  let sendData = [params.number, params.startDate, params.endDate, 0, 100];

  return await fetchPolaris({
    op: '13610101',
    data: sendData,
    subdomain,
  }).then((res) => JSON.parse(res));
};
