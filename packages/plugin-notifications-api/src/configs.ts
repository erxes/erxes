import typeDefs from './graphql/typeDefs';
import resolvers from './graphql/resolvers';
import apiConnect from './apiCollections';

import { IFetchElkArgs } from '@erxes/api-utils/src/types';
import { initBroker } from './messageBroker';
import { generateModels, models } from './connectionResolver';

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
  name: 'notifications',
  graphql: (sd) => {
    serviceDiscovery = sd;
    return {
      typeDefs,
      resolvers,
    };
  },
  hasSubscriptions: true,
  segment: {},
  apolloServerContext: (context) => {
    context.models = models;
  },
  onServerInit: async (options) => {
    await apiConnect();

    initBroker(options.messageBrokerClient);

    mainDb = options.db;

    await generateModels('os');

    initBroker(options.messageBrokerClient);

    debug = options.debug;
    graphqlPubsub = options.pubsubClient;
    es = options.elasticsearch;
  },
};
