import { getConfig, toPolaris } from './utils';

export const loanDetailToErxes = async (subdomain, params) => {
  const config = await getConfig(subdomain, 'POLARIS', {});

  const sendParams = [params.contractNumber, 0];
  const response = await toPolaris({
    op: '13610200',
    data: sendParams,
    subdomain,
  });

  return response;
};

export const loanScheduleToErxes = async (subdomain, params) => {
  const config = await getConfig(subdomain, 'POLARIS', {});

  const sendParams = [params.contractNumber];

  const response = await toPolaris({
    op: '13610203',
    data: sendParams,
    subdomain,
  });

  return JSON.parse(response);
};
