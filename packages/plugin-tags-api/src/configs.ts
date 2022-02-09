import typeDefs from './graphql/typeDefs';
import resolvers from './graphql/resolvers';

import { initBroker } from './messageBroker';
import { initMemoryStorage } from './inmemoryStorage';

export let debug;

export default {
  name: 'tags',
  graphql: async (sd) => {
    return {
      typeDefs: await typeDefs(sd),
      resolvers
    }
  },
  apolloServerContext: context => {
    return context;
  },
  onServerInit: async options => {
    initBroker(options.messageBrokerClient);

    initMemoryStorage();

    debug = options.debug;
  }
};
