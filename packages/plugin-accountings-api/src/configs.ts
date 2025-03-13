import { getSubdomain } from '@erxes/api-utils/src/core';
import { generateModels } from './connectionResolver';
import { generateAllDataLoaders } from './dataloaders';
import resolvers from './dataloaders/resolvers';
import forms from './forms';
import typeDefs from './graphql/typeDefs';
import imports from './imports';
import logs from './logUtils';
import { setupMessageConsumers } from './messageBroker';
import * as permissions from './permissions';

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
    imports,
    forms,
    permissions,
  },

  onServerInit: async () => { },
  setupMessageConsumers,
};
