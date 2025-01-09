import { fetchPolaris } from '../utils';

export const getLoanCollaterials = async (subdomain, polarisConfig, params) => {
  const sendData = [params.number];

  const loanCollaterials = await fetchPolaris({
    subdomain,
    op: '13610904',
    data: sendData,
    polarisConfig,
  });

  return loanCollaterials;
};
