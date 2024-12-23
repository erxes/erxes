import typeDefs from './graphql/typeDefs';
import { generateModels } from './connectionResolver';
import { setupMessageConsumers } from './messageBroker';
import { getSubdomain } from '@erxes/api-utils/src/core';
import loginValidator from './loginValidator';

export default {
  name: 'activedirectory',
  graphql: async () => {
    return {
      typeDefs: await typeDefs(),
    };
  },

  apolloServerContext: async (context, req) => {
    const subdomain = getSubdomain(req);

    context.subdomain = subdomain;
    context.models = await generateModels(subdomain);

    return context;
  },

  onServerInit: async () => {},
  setupMessageConsumers,
  meta: { loginValidator },
};
