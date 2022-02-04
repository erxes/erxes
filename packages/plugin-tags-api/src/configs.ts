import typeDefs from './graphql/typeDefs';
import resolvers from './graphql/resolvers';

import { initBroker } from './messageBroker';
import { initMemoryStorage } from './inmemoryStorage';

export let debug;
export let serviceDiscovery;

export default {
  name: 'tags',
  graphql: async (sd) => {
    serviceDiscovery = sd;

    return {
      typeDefs: await typeDefs(serviceDiscovery),
      resolvers
    }
  },
  apolloServerContext: context => {
    return context;
  },
  onServerInit: async options => {
    initBroker(options.messageBrokerClient);

    initMemoryStorage();

    debug = options.debug;
  }
};
