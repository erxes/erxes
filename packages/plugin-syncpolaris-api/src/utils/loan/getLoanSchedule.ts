import { fetchPolaris } from '../utils';

export const getLoanSchedule = async (subdomain, params) => {
  return await fetchPolaris({
    subdomain,
    op: '13610203',
    data: [params.number],
  }).then((response) => JSON.parse(response));
};
