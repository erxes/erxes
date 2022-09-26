import typeDefs from './graphql/typeDefs';
import resolvers from './dataloaders/resolvers';

import { initBroker } from './messageBroker';
import { generateAllDataLoaders } from './dataloaders';
import { generateModels } from './connectionResolver';
import logs from './logUtils';
import tags from './tags';
import internalNotes from './internalNotes';
import forms from './forms';
import * as permissions from './permissions';
import { getSubdomain } from '@erxes/api-utils/src/core';
import imports from './imports';

export let debug;
export let mainDb;
export let serviceDiscovery;

export default {
  name: 'products',
  permissions,
  graphql: async sd => {
    serviceDiscovery = sd;

    return {
      typeDefs: await typeDefs(sd),
      resolvers
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
    tags,
    internalNotes,
    forms,
    imports,
    permissions
  },

  onServerInit: async options => {
    initBroker(options.messageBrokerClient);

    debug = options.debug;
  }
};
