import typeDefs from './graphql/typeDefs';
import resolvers from './graphql/resolvers';
import * as permissions from './permissions';

import { setupMessageConsumers } from './messageBroker';
import { getSubdomain } from '@erxes/api-utils/src/core';
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
    const subdomain = getSubdomain(req);
    const models = await generateModels(subdomain);

    context.subdomain = subdomain;
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
