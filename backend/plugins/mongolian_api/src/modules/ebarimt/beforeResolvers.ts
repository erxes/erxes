import { generateModels } from '~/connectionResolvers';
import { companyCheckCode } from './utils';

const resolvers = {
  contacts: ['companiesAdd', 'companiesEdit'],
};

export default resolvers;

export const beforeResolverHandlers = async (subdomain, params) => {
  const models = await generateModels(subdomain);
  const { resolver, args } = params;

  if (resolvers.contacts.includes(resolver)) {
    return companyCheckCode(args, models);
  }

  return args;
};
