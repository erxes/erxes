import typeDefs from './graphql/typeDefs';
import resolvers from './graphql/resolvers';
import { IFetchElkArgs } from '@erxes/api-utils/src/types';
import { generateModels, models } from './connectionResolver';

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
  name: 'pos',
  permissions: {
    pos: {
      name: 'pos',
      description: 'POS',
      actions: [
        {
          name: 'posAll',
          description: 'All',
          use: [
            'managePos',
            'showPos'
          ]
        },
        {
          name: 'managePos',
          description: 'Manage POS'
        },
        {
          name: 'showPos',
          description: 'Show'
        }
      ]
    },
  },
  graphql: async (sd) => {
    serviceDiscovery = sd;
    return {
      typeDefs: await typeDefs(sd),
      resolvers: await resolvers(sd),
    };
  },
  apolloServerContext: (context) => {
    const subdomain = 'os';

    context.subdomain = subdomain;
    context.models = models;

    return context;
  },
  onServerInit: async (options) => {
    mainDb = options.db;

    await generateModels('os');

    initBroker(options.messageBrokerClient);

    initMemoryStorage();

    debug = options.debug;
    graphqlPubsub = options.pubsubClient;
    es = options.elasticsearch;
  },
  meta: {},
};
