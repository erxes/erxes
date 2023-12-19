import typeDefs from './graphql/typeDefs';
import resolvers from './graphql/resolvers';
import { initBroker } from './messageBroker';
import { getSubdomain } from '@erxes/api-utils/src/core';

export let mainDb;
export let graphqlPubsub;
export let serviceDiscovery;
export let debug;

export default {
  name: 'dailyco',
  graphql: async sd => {
    serviceDiscovery = sd;
    return {
      typeDefs: await typeDefs(sd),
      resolvers
    };
  },
  apolloServerContext: async (context, req): Promise<any> => {
    const subdomain: string = getSubdomain(req);
    context.subdomain = subdomain;
    return context;
  },

  onServerInit: async options => {
    mainDb = options.db;

    debug = options.debug;
    graphqlPubsub = options.pubsubClient;

    initBroker(options.messageBrokerClient);
  }
};
