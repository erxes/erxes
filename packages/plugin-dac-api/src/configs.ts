import { initBroker } from './messageBroker';
import typeDefs from './graphql/typeDefs';
import resolvers from './graphql/resolvers';
import afterMutations from './afterMutations';
import {
  createCustomer,
  getCustomer,
  getCustomerByCardCode,
  updateCustomer
} from './api/erxesApi';

export let mainDb;
export let debug;
export let graphqlPubsub;
export let serviceDiscovery;

export default {
  name: 'dac',
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
    {
      path: `/customer`,
      method: getCustomer
    },
    {
      path: `/customerId`,
      method: getCustomerByCardCode
    }
  ],
  postHandlers: [
    { path: `/customer`, method: createCustomer },
    { path: `/customerUpdate`, method: updateCustomer }
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
