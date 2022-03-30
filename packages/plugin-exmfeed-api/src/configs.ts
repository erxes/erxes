import typeDefs from './graphql/typeDefs';
import resolvers from './graphql/resolvers';
import { IFetchElkArgs } from '@erxes/api-utils/src/types';
import { generateCoreModels, generateModels } from './connectionResolver';
import { initBroker } from './messageBroker';
import { initMemoryStorage } from './inmemoryStorage';

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
  name: 'exmfeed',
  graphql: async sd => {
    serviceDiscovery = sd;

    return {
      typeDefs: await typeDefs(),
      resolvers: await resolvers()
    };
  },

  apolloServerContext: async context => {
    const subdomain = 'os';

    context.subdomain = subdomain;
    context.models = await generateModels(subdomain);
    context.coreModels = await generateCoreModels(subdomain);

    return context;
  },

  onServerInit: async options => {
    mainDb = options.db;

    initBroker(options.messageBrokerClient);

    initMemoryStorage();

    debug = options.debug;
    graphqlPubsub = options.pubsubClient;
    es = options.elasticsearch;
  },
  meta: {}
};
