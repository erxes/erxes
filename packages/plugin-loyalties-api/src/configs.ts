import typeDefs from './graphql/typeDefs';
import resolvers from './graphql/resolvers';
import { IFetchElkArgs } from '@erxes/api-utils/src/types';
import { generateModels, models } from './connectionResolver';

import { initBroker } from './messageBroker';
import { initMemoryStorage } from './inmemoryStorage';
import logs from './logUtils';
import automations from './automations';

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
  name: 'loyalties',
  permissions: {
    loyalties: {
      name: 'loyalties',
      description: 'Loyalties',
      actions: [
        {
          name: 'loyaltyAll',
          description: 'All',
          use: [
            'showLoyalties',
            'manageLoyalties'
          ]
        },
        {
          name: 'showLoyalties',
          description: 'Show loyalties'
        },
        {
          name: 'manageLoyalties',
          description: 'Manage loyalties'
        }
      ]
    },
  },
  meta: {
    logs: { loyalties: logs },
    automations,
  },
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

    initBroker(options.messageBrokerClient);

    initMemoryStorage();

    debug = options.debug;
    graphqlPubsub = options.pubsubClient;
    es = options.elasticsearch;
  }
};
