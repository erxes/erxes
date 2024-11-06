import { fetchPolaris } from '../utils';

export const activeLoan = async (subdomain: string, polarisConfig, params: any[]) => {
  const result = await fetchPolaris({
    op: '13610263',
    data: params,
    subdomain,
    polarisConfig,
  });

  return result;
};
