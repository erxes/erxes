import typeDefs from './graphql/typeDefs';
import resolvers from './graphql/resolvers';

import { initBroker } from './messageBroker';
import init from './controller';





export default {
  name: '{name}',
  graphql: () => {
    return {
      typeDefs,
      resolvers
    };
  },
  meta: {
    inboxIntegration: {
      kind: '{name}',
      label: '{Name}'
    }
  },
  apolloServerContext: async (context) => {
    return context;
  },

  onServerInit: async options => {
    

    

    initBroker();
    init();
  }
};
