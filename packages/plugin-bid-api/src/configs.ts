import typeDefs from './graphql/typeDefs';
import resolvers from './graphql/resolvers';
import afterMutations from './afterMutations';
import { setupMessageConsumers } from './messageBroker';
import { addCustomer } from './utils';
import { getSubdomain } from '@erxes/api-utils/src/core';
import { generateModels } from './connectionResolver';

export default {
  name: 'bid',
  graphql: async () => {
    return {
      typeDefs: await typeDefs(),
      resolvers: await resolvers(),
    };
  },

  postHandlers: [
    {
      path: `/customer`,
      method: addCustomer,
    },
  ],

  meta: {
    afterMutations,
  },

  apolloServerContext: async (context, req) => {
    const subdomain = getSubdomain(req);
    const models = await generateModels(subdomain);

    context.subdomain = subdomain;
    context.models = models;

    return context;
  },

  onServerInit: async () => {},
  setupMessageConsumers,
};
