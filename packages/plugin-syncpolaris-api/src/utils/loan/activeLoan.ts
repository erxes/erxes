import { fetchPolaris } from '../utils';

export const activeLoan = async (subdomain: string, params: any[]) => {
  const result = await fetchPolaris({
    op: '13610263',
    data: params,
    subdomain,
  });

  return result;
};
