import { fetchPolaris } from '../utils';

export const activeSaving = async (
  subdomain: string,
  polarisConfig,
  params: any[]
) => {
  const result = await fetchPolaris({
    op: '13610122',
    data: params,
    subdomain,
    polarisConfig,
  });

  return result;
};
