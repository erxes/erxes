import typeDefs from './graphql/typeDefs';
import resolvers from './graphql/resolvers';
import afterMutations from './afterMutations';
import { initBroker } from './messageBroker';
import { addCustomer } from './utils';

export let mainDb;
export let debug;



export default {
  name: 'bid',
  graphql: async () => {
    

    return {
      typeDefs: await typeDefs(),
      resolvers: await resolvers(),
    };
  },

  postHandlers: [
    {
      path: `/customer`,
      method: addCustomer,
    },
  ],

  meta: {
    afterMutations,
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
