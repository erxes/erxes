import { companyCheckCode } from './utils';

export default {
  contacts: ['companiesAdd', 'companiesEdit']
};

export const beforeResolverHandlers = async (subdomain, params) => {
  const { args } = params;

  return companyCheckCode(args, subdomain);
};
