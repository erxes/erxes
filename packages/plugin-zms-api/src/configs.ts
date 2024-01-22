import typeDefs from './graphql/typeDefs';
import resolvers from './graphql/resolvers';

import { initBroker } from './messageBroker';

export let mainDb;
export let debug;

export default {
  name: 'zms',
  graphql: async () => {
    return {
      typeDefs: await typeDefs(),
      resolvers: await resolvers(),
    };
  },

  apolloServerContext: async (context) => {
    return context;
  },

  onServerInit: async (options) => {
    mainDb = options.db;

    initBroker();

    debug = options.debug;
  },
};
