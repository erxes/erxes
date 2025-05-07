import typeDefs from './graphql/typeDefs';
import resolvers from './graphql/resolvers';

import { setupMessageConsumers } from './messageBroker';
import { getSubdomain } from '@erxes/api-utils/src/core';
import { generateModels } from './connectionResolver';
import afterMutations from './afterMutations';
import cpCustomerHandle from './cpCustomerHandle';
import cronjobs from './cronjobs';
import logUtils from './logUtils';

export default {
  name: 'msdynamic',
  graphql: async () => {
    return {
      typeDefs: await typeDefs(),
      resolvers: await resolvers(),
    };
  },

  meta: {
    logs: { consumers: logUtils },
    cronjobs,
    afterMutations,
    cpCustomerHandle,
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
