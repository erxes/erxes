import typeDefs from './graphql/typeDefs';
import resolvers from './graphql/resolvers';
import { setupMessageConsumers } from './messageBroker';

export default {
  name: 'dailyco',
  graphql: async () => {
    return {
      typeDefs: await typeDefs(),
      resolvers,
    };
  },
  apolloServerContext: async (context, req): Promise<any> => {
    return context;
  },

  onServerInit: async () => {},
  setupMessageConsumers,
};
