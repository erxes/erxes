import typeDefs from './graphql/typeDefs';
import resolvers from './graphql/resolvers';
import { generateModels } from './connectionResolver';

import { initBroker } from './messageBroker';
import { initMemoryStorage } from './inmemoryStorage';
import { getSubdomain } from '@erxes/api-utils/src/core';

export let debug: any;
export let graphqlPubsub: any;
export let mainDb: any;
export let serviceDiscovery: any;

export default {
  name: 'salesplans',
  graphql: async (sd: any) => {
    serviceDiscovery = sd;
    return {
      typeDefs: await typeDefs(),
      resolvers: await resolvers()
    };
  },
  apolloServerContext: async (context: any, req: any) => {
    const subdomain = getSubdomain(req);

    context.subdomain = subdomain;
    context.models = await generateModels(subdomain);

    return context;
  },
  onServerInit: async (options: any) => {
    mainDb = options.db;

    initBroker(options.messageBrokerClient);

    initMemoryStorage();

    debug = options.debug;
    graphqlPubsub = options.pubsubClient;
  },

  meta: {}
};
