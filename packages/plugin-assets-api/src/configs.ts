import typeDefs from './graphql/typeDefs';
import resolvers from './dataloaders/resolvers';

import { initBroker } from './messageBroker';
import { getSubdomain } from '@erxes/api-utils/src/core';
import { generateModels } from './connectionResolver';
import { generateAllDataLoaders } from './dataloaders';
import imports from './imports';
import exporter from './exporter';
import forms from './forms';
import internalNotes from './internalNotes';
import logUtils from './logUtils';
import * as permissions from './permissions';

export let mainDb;
export let debug;

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
    const subdomain = getSubdomain(req);
    const models = await generateModels(subdomain);

    context.subdomain = req.hostname;
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

  onServerInit: async (options) => {
    mainDb = options.db;

    initBroker(options.messageBrokerClient);

    debug = options.debug;
  },
};
