import typeDefs from './graphql/typeDefs';
import resolvers from './graphql/resolvers';

import { generateModels } from './connectionResolver';
import { getSubdomain } from '@erxes/api-utils/src/core';
import { initBroker } from './messageBroker';
import * as permissions from './permissions';

export let mainDb;
export let graphqlPubsub;
export let serviceDiscovery;

export let debug;

export default {
  name: 'filemanager',
  permissions,
  graphql: sd => {
    serviceDiscovery = sd;
    return {
      typeDefs,
      resolvers
    };
  },
  segment: {},
  apolloServerContext: async (context, req) => {
    const subdomain = getSubdomain(req);

    context.subdomain = subdomain;
    context.models = await generateModels(subdomain);
  },

  onServerInit: async options => {
    mainDb = options.db;

    initBroker(options.messageBrokerClient);

    debug = options.debug;
    graphqlPubsub = options.pubsubClient;
  }
};
