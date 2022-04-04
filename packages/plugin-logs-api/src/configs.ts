import typeDefs from './graphql/typeDefs';
import resolvers from './graphql/resolvers';

import { IFetchElkArgs } from '@erxes/api-utils/src/types';
import { initBroker } from './messageBroker';
import { generateModels } from './connectionResolver';

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
  name: 'logs',
  graphql: async (sd) => {
    serviceDiscovery = sd;

    return {
      typeDefs: await typeDefs(sd),
      resolvers,
    }
  },
  hasSubscriptions: false,
  segment: {},
  apolloServerContext: async (context) => {
    const subdomain = 'os';

    context.models = await generateModels(subdomain);
    context.subdomain = subdomain;

    return context;
  },
  onServerInit: async (options) => {
    mainDb = options.db;

    initBroker(options.messageBrokerClient);

    debug = options.debug;
    graphqlPubsub = options.pubsubClient;
    es = options.elasticsearch;
  },
};
