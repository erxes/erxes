import { fetchPolaris } from '../utils';

export const getDate = async (subdomain: string, polarisConfig) => {
  const result = await fetchPolaris({
    op: '13619000',
    data: [],
    subdomain,
    polarisConfig,
  });

  return result;
};
