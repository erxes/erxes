import { companyCheckCode } from './utils';

export default {
  contacts: ['companiesAdd', 'companiesEdit']
};

export const beforeResolverHandlers = async (subdomain, params) => {
  const { resolver, args, user } = params;

  return companyCheckCode(user, args, subdomain);
};
