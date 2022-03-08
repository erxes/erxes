import typeDefs from './graphql/typeDefs';
import resolvers from './graphql/resolvers';
import { IFetchElkArgs } from '@erxes/api-utils/src/types';

import { initBroker } from './messageBroker';
import { initMemoryStorage } from './inmemoryStorage';
import apiConnect from './apiCollections';
import { coreModels, generateModels, models } from './connectionResolver';

export let mainDb;
export let debug;
export let graphqlPubsub;
export let serviceDiscovery;

export let es: {
  client;
  fetchElk(args: IFetchElkArgs): Promise<any>;
  getMappings(index: string): Promise<any>;
  getIndexPrefix(): string;
};

export default {
  name: 'internalnotes',
  graphql: async (sd) => {
    serviceDiscovery = sd;

    return {
      typeDefs: await typeDefs(sd),
      resolvers: await resolvers(sd),
    };
  },
  apolloServerContext: (context) => {
    context.models = models;
    context.coreModels = coreModels;
  },
  onServerInit: async (options) => {
    mainDb = options.db;

    await generateModels('os');

    await apiConnect();

    initBroker(options.messageBrokerClient);

    initMemoryStorage();

    graphqlPubsub = options.pubsubClient;
    debug = options.debug;
    es = options.elasticsearch;
  },
  meta: {
    logs: { providesActivityLog: true },
  },
};
