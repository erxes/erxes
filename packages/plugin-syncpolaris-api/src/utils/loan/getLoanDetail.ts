import { fetchPolaris } from '../utils';

export const getLoanDetail = async (subdomain, params) => {
  const loanDetail = await fetchPolaris({
    subdomain,
    op: '13610200',
    data: [params.number, 0],
  }).then((response) => JSON.parse(response));

  return loanDetail;
};
