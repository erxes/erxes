import typeDefs from './graphql/typeDefs';
import resolvers from './graphql/resolvers';
import { getSubdomain } from '@erxes/api-utils/src/core';
import { setupMessageConsumers } from './messageBroker';
import { generateModels } from './connectionResolver';

export default {
  name: 'meetings',
  graphql: async () => {
    return {
      typeDefs: await typeDefs(),
      resolvers: await resolvers(),
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
};
