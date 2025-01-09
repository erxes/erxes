import { fetchPolaris } from '../utils';

export const getDepositStatement = async (subdomain, polarisConfig, params) => {
  return await fetchPolaris({
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
    polarisConfig,
    subdomain,
  });
};
