import typeDefs from './graphql/typeDefs';
import resolvers from './graphql/resolvers';

import { initBroker } from './messageBroker';
import { initMemoryStorage } from './inmemoryStorage';
import apiConnect from './apiCollections';

export let debug;
export let graphqlPubsub;
export let serviceDiscovery;

export default {
  name: 'internalnotes',
  graphql: async (sd) => {
    serviceDiscovery = sd;

    return {
      typeDefs: await typeDefs(sd),
      resolvers
    }
  },
  apolloServerContext: context => {
    return context;
  },
  onServerInit: async options => {
    await apiConnect();

    initBroker(options.messageBrokerClient);

    initMemoryStorage();

    graphqlPubsub = options.pubsubClient;

    debug = options.debug;
  }
};
