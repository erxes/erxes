import typeDefs from './graphql/typeDefs';
import resolvers from './dataloaders/resolvers';

import { setupMessageConsumers } from './messageBroker';
import { generateModels } from './connectionResolver';
import { generateAllDataLoaders } from './dataloaders';
import imports from './imports';
import exporter from './exporter';
import forms from './forms';
import internalNotes from './internalNotes';
import logUtils from './logUtils';
import * as permissions from './permissions';
import { getSubdomainHeader } from '@erxes/api-utils/src/headers';

export default {
  name: 'assets',
  permissions,
  graphql: async () => {
    return {
      typeDefs: await typeDefs(),
      resolvers: await resolvers(),
    };
  },
  apolloServerContext: async (context, req) => {
    const { subdomain } = context;
    const models = await generateModels(subdomain);

    context.models = models;

    context.dataLoaders = generateAllDataLoaders(models, subdomain);

    return context;
  },

  meta: {
    logs: { consumers: logUtils },
    internalNotes,
    imports,
    exporter,
    forms,
  },

  onServerInit: async () => {},
  setupMessageConsumers,
};
