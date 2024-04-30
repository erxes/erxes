import typeDefs from './graphql/typeDefs';
import resolvers from './graphql/resolvers';
import { setupMessageConsumers } from './messageBroker';
import init from './controller';

export default {
  name: 'golomtbank',
  graphql: () => {
    return {
      typeDefs,
      resolvers
    };
  },
  meta: {
    inboxIntegration: {
      kind: 'golomtbank',
      label: 'Golomtbank'
    }
  },
  apolloServerContext: async (context) => {
    return context;
  },

  onServerInit: async () => {
    init();
  },
  setupMessageConsumers,
};
