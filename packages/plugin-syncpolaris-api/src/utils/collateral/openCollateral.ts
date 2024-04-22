import { fetchPolaris } from '../utils';

export const openCollateral = async (
  subdomain: string,
  accCode
) => {
  return await fetchPolaris({
    subdomain,
    op: '13610901',
    data: [accCode]
  });;
};
