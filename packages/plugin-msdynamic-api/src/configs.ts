import typeDefs from './graphql/typeDefs';
import resolvers from './graphql/resolvers';

import { setupMessageConsumers } from './messageBroker';
import { getSubdomain } from '@erxes/api-utils/src/core';
import { generateModels } from './connectionResolver';
import afterMutations from './afterMutations';
import cpCustomerHandle from './cpCustomerHandle';
import cronjobs from './cronjobs';

export default {
  name: 'msdynamic',
  graphql: async () => {
    return {
      typeDefs: await typeDefs(),
      resolvers: await resolvers(),
    };
  },

  meta: { cronjobs, afterMutations, cpCustomerHandle },

  apolloServerContext: async (context, req) => {
    const subdomain = getSubdomain(req);

    context.subdomain = subdomain;
    context.models = await generateModels(subdomain);

    return context;
  },

  onServerInit: async () => {},
  setupMessageConsumers,
};
