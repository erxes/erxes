import { fetchPolaris } from '../utils';

export const getDepositStatement = async (subdomain, params) => {
  const balance = await fetchPolaris({
    op: '13610302',
    data: [
      {
        acntCode: params.number,
        startDate: params.startDate,
        endDate: params.endDate,
        orderBy: 'desc',
        seeNotFinancial: 0,
        seeCorr: 0,
        seeReverse: 0,
        startPosition: 0,
        count: 100,
      },
    ],
    subdomain,
  }).then((res) => JSON.parse(res));

  return balance;
};
