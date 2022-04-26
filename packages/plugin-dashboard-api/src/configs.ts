import resolvers from './graphql/resolvers';
import { typeDefs } from './graphql/typeDefs';

import { IFetchElkArgs } from '@erxes/api-utils/src/types';
import { initBroker } from './messageBroker';
import { connectCoreModels } from './coreDb';

export let graphqlPubsub;
export let serviceDiscovery;
export let mainDb;

export let es: {
  client;
  fetchElk(args: IFetchElkArgs): Promise<any>;
  getMappings(index: string): Promise<any>;
  getIndexPrefix(): string;
};

export let debug;

export default {
  name: 'dashboard',
  graphql: async (sd) => {
    serviceDiscovery = sd;

    return {
      typeDefs,
      resolvers,
    }
  },
  hasSubscriptions: false,
  segment: {},
  onServerInit: async (options) => {
    mainDb = options.db;

    await connectCoreModels();

    initBroker(options.messageBrokerClient);

    debug = options.debug;
    graphqlPubsub = options.pubsubClient;
    es = options.elasticsearch;
  },
};