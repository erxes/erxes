import { getConfig, toPolaris } from './utils';

export const loanDetailToErxes = async (subdomain, params) => {
  const config = await getConfig(subdomain, 'POLARIS', {});

  const sendParams = [params.contractNumber, 0];
  const response = await toPolaris({
    apiUrl: config.apiUrl,
    company: config.company,
    op: '13610200',
    role: config.role,
    token: config.token,
    data: sendParams,
  });

  return response;
};

export const loanScheduleToErxes = async (subdomain, params) => {
  const config = await getConfig(subdomain, 'POLARIS', {});

  const sendParams = [params.contractNumber];

  const response = await toPolaris({
    apiUrl: config.apiUrl,
    company: config.companyCode,
    op: '13610203',
    role: config.role,
    token: config.token,
    data: sendParams,
  });

  return JSON.parse(response);
};
