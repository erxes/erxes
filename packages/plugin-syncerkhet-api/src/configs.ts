import typeDefs from './graphql/typeDefs';
import resolvers from './graphql/resolvers';
import { IFetchElkArgs } from '@erxes/api-utils/src/types';
import { generateModels, models } from './connectionResolver';

import { initBroker, initBrokerErkhet } from './messageBroker';
import { initMemoryStorage } from './inmemoryStorage';
import afterMutations from './afterMutations';

export let debug;
export let graphqlPubsub;
export let mainDb;
export let serviceDiscovery;

export let es: {
  client;
  fetchElk(args: IFetchElkArgs): Promise<any>;
  getMappings(index: string): Promise<any>;
  getIndexPrefix(): string;
};

export default {
  name: 'syncerkhet',
  graphql: async (sd) => {
    serviceDiscovery = sd;
    return {
      typeDefs: await typeDefs(sd),
      resolvers: await resolvers(sd),
    };
  },
  apolloServerContext: (context) => {
    const subdomain = "os"

    context.subdomain = subdomain
    context.models = models;

    return context;
  },
  onServerInit: async (options) => {
    mainDb = options.db;

    await generateModels('os');

    await initBroker(options.messageBrokerClient);
    await initBrokerErkhet();

    initMemoryStorage();

    debug = options.debug;
    graphqlPubsub = options.pubsubClient;
    es = options.elasticsearch;
  },
  meta: {
    afterMutations
  }
};
