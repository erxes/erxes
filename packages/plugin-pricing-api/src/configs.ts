import typeDefs from './graphql/typeDefs';
import resolvers from './graphql/resolvers';
import * as permissions from './permissions';

import { initBroker } from './messageBroker';
import { getSubdomain } from '@erxes/api-utils/src/core';
import { generateModels } from './connectionResolver';
import logs from './logUtils';
export let mainDb;
export let debug;
export let graphqlPubsub;
export let serviceDiscovery;

export default {
  name: 'pricing',
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
    const models = await generateModels(subdomain);

    context.subdomain = subdomain;
    context.models = models;

    return context;
  },

  onServerInit: async options => {
    mainDb = options.db;

    initBroker(options.messageBrokerClient);

    graphqlPubsub = options.pubsubClient;

    debug = options.debug;
  },
  meta: {
    permissions,
    logs: { consumers: logs }
  }
};
