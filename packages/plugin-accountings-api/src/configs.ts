import typeDefs from './graphql/typeDefs';
import resolvers from './dataloaders/resolvers';

import { setupMessageConsumers } from './messageBroker';
import { generateAllDataLoaders } from './dataloaders';
import { generateModels } from './connectionResolver';
import logs from './logUtils';
import * as permissions from './permissions';
import { getSubdomain } from '@erxes/api-utils/src/core';

export default {
  name: 'accountings',
  permissions,
  graphql: async () => {
    return {
      typeDefs: await typeDefs(),
      resolvers,
    };
  },
  apolloServerContext: async (context, req) => {
    const subdomain = getSubdomain(req);

    context.subdomain = subdomain;

    const models = await generateModels(subdomain);

    context.models = models;

    context.dataLoaders = generateAllDataLoaders(models, subdomain);

    return context;
  },

  meta: {
    logs: { consumers: logs },
    permissions,
  },

  onServerInit: async () => {},
  setupMessageConsumers,
};
