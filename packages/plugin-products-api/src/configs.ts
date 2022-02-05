import typeDefs from './graphql/typeDefs';
import resolvers from './graphql/resolvers';

import { initBroker } from './messageBroker';
import { initMemoryStorage } from './inmemoryStorage';
import apiConnect from './apiCollections';
import { generateAllDataLoaders } from './dataloaders';

export let debug;

export default {
  name: 'products',
  graphql: async (sd) => {
    return {
      typeDefs: await typeDefs(sd),
      resolvers
    }
  },
  apolloServerContext: context => {
    context.dataLoaders = generateAllDataLoaders();
    return context;
  },
  onServerInit: async options => {
    await apiConnect();

    initBroker(options.messageBrokerClient);

    initMemoryStorage();

    debug = options.debug;
  }
};