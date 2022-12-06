import { initBroker } from './messageBroker';
import typeDefs from './graphql/typeDefs';
import resolvers from './graphql/resolvers';
import afterMutations from './afterMutations';
export let mainDb;
export let debug;
export let graphqlPubsub;
export let serviceDiscovery;

export default {
  name: 'das',
  graphql: async sd => {
    serviceDiscovery = sd;

    return {
      typeDefs: await typeDefs(sd),
      resolvers
    };
  },
  hasSubscriptions: false,

  meta: {
    afterMutations
  },

  getHandlers: [
    { path: `/customer`, method: getCustomer },
    { path: `/pos-sync-config`, method: posSyncConfig }
  ],
  postHandlers: [
    { path: `/customer/update`, method: unfetchOrderInfo },
    { path: `/customer/create`, method: posSyncOrders }
  ],

  apolloServerContext: async context => {
    return context;
  },

  onServerInit: async options => {
    mainDb = options.db;

    initBroker(options.messageBrokerClient);

    graphqlPubsub = options.pubsubClient;

    debug = options.debug;
  }
};
