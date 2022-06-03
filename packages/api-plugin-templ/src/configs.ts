import typeDefs from './graphql/typeDefs';
import resolvers from './graphql/resolvers';

import { initBroker } from './messageBroker';

export let mainDb;
export let debug;
export let graphqlPubsub;
export let serviceDiscovery;

export default {
  name: '{name}',
  graphql: async sd => {
    serviceDiscovery = sd;

    return {
      typeDefs: await typeDefs(sd),
      resolvers: await resolvers(sd)
    };
  },
  onServerInit: async options => {
    mainDb = options.db;

    initBroker(options.messageBrokerClient);

    graphqlPubsub = options.pubsubClient;

    debug = options.debug;
  }
};
