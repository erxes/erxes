import typeDefs from './graphql/typeDefs';
import resolvers from './graphql/resolvers';

import { initBroker } from './messageBroker';

export let debug;
export let mainDb;



export default {
  name: 'rentpay',
  graphql: async () => {
    return {
      typeDefs: await typeDefs(),
      resolvers: await resolvers()
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
