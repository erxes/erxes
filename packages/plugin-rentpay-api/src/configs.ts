import typeDefs from './graphql/typeDefs';
import resolvers from './graphql/resolvers';

import { initBroker } from './messageBroker';

export let debug;
export let mainDb;

export let serviceDiscovery;

export default {
  name: 'rentpay',
  graphql: async sd => {
    serviceDiscovery = sd;

    return {
      typeDefs: await typeDefs(sd),
      resolvers: await resolvers(sd)
    };
  },
  apolloServerContext: async context => {
    return context;
  },
  onServerInit: async options => {
    initBroker(options.messageBrokerClient);

    mainDb = options.db;
    debug = options.debug;
  }
};
