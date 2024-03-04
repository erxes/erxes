import { fetchPolaris } from '../utils';

export const getSavingDetail = async (subdomain, params) => {
  const savingDetail = await fetchPolaris({
    subdomain,
    op: '13610100',
    data: [params.number, 0],
  }).then((response) => JSON.parse(response));

  return savingDetail;
};
