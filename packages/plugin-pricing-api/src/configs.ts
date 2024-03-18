import typeDefs from './graphql/typeDefs';
import resolvers from './graphql/resolvers';
import * as permissions from './permissions';

import { setupMessageConsumers } from './messageBroker';
import { generateModels } from './connectionResolver';
import logs from './logUtils';

export default {
  name: 'pricing',
  permissions,
  graphql: async () => {
    return {
      typeDefs: await typeDefs(),
      resolvers,
    };
  },

  apolloServerContext: async (context, req) => {
    const { subdomain } = context;
    const models = await generateModels(subdomain);

    context.models = models;

    return context;
  },

  onServerInit: async () => {},
  setupMessageConsumers,
  meta: {
    permissions,
    logs: { consumers: logs },
  },
};
