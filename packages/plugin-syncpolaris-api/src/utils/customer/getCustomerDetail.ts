import { fetchPolaris } from '../utils';

interface IParams {
  code: string;
}

export const getCustomerDetail = async (subdomain: string, polarisConfig, params: IParams) => {
  if (!params.code) throw new Error('Code required!');

  let sendData = [params.code];

  return await fetchPolaris({
    subdomain,
    op: '13610310',
    data: sendData,
    polarisConfig,
  });
};
