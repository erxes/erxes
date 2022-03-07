import typeDefs from './graphql/typeDefs';
import resolvers from './graphql/resolvers';
import { initBroker } from './messageBroker';

import { IFetchElkArgs } from '@erxes/api-utils/src/types';
import { coreModels, generateModels, models } from './connectionResolver';

export let mainDb;
export let graphqlPubsub;
export let serviceDiscovery;

export let es: {
  client;
  fetchElk(args: IFetchElkArgs): Promise<any>;
  getMappings(index: string): Promise<any>;
  getIndexPrefix(): string;
};

export let debug;

export default {
  name: 'knowledgebase',
  graphql: (sd) => {
    serviceDiscovery = sd;
    
    return {
      typeDefs,
      resolvers,
    }
  },
  hasSubscriptions: false,
  segment: {},

  apolloServerContext: (context) => {
    context.models = models;
    context.coreModels = coreModels;
  },
  onServerInit: async (options) => {
    mainDb = options.db;

    await generateModels('os');

    initBroker(options.messageBrokerClient);

    debug = options.debug;
    graphqlPubsub = options.pubsubClient;
    es = options.elasticsearch;
  },
};
