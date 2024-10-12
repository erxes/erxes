import { fetchPolaris } from '../utils';

export const getLoanSchedule = async (subdomain, polarisConfig, params) => {

  return await fetchPolaris({
    subdomain,
    op: '13610203',
    data: [params.number],
    polarisConfig,
  });
};
