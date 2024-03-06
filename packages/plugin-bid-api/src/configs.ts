import typeDefs from './graphql/typeDefs';
import resolvers from './graphql/resolvers';
import afterMutations from './afterMutations';
import { setupMessageConsumers } from './messageBroker';
import { addCustomer } from './utils';





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

  onServerInit: async () => {
  },
  setupMessageConsumers,
};
