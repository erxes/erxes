import { fetchPolaris, getLoanContract } from '../utils';

export const getLoanCollaterials = async (subdomain, params) => {
  const sendData = [params.number];

  const loanCollaterials = await fetchPolaris({
    subdomain,
    op: '13610904',
    data: sendData,
  }).then((response) => JSON.parse(response));

  return loanCollaterials;
};
