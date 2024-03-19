import { fetchPolaris } from '../utils';

interface IParams {
  code: string;
}

export const getCustomerDetail = async (subdomain: string, params: IParams) => {
  if (!params.code) throw new Error('Code required!');

  let sendData = [params.code];

  const customerDetail = await fetchPolaris({
    subdomain,
    op: '13610310',
    data: sendData,
  });

  return JSON.parse(customerDetail);
};
