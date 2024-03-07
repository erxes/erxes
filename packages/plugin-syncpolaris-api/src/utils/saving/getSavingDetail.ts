import { fetchPolaris } from '../utils';

export const getSavingDetail = async (subdomain, params) => {
  return await fetchPolaris({
    subdomain,
    op: '13610100',
    data: [params.number, 0],
  }).then((response) => JSON.parse(response));
};
