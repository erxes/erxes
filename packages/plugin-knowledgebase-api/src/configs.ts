import typeDefs from './graphql/typeDefs';
import resolvers from './graphql/resolvers';
import { initBroker } from './messageBroker';

import { IFetchElkArgs } from '@erxes/api-utils/src/types';
import { generateModels } from './connectionResolver';
import logs from './logUtils';
import permissions from './permissions';
import { getSubdomain } from '@erxes/api-utils/src/core';

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
  permissions,
  segment: {},
  meta: { logs: { consumers: logs } },
  apolloServerContext: async (context, req) => {
    const subdomain = getSubdomain(req);

    context.subdomain = subdomain;
    context.models = await generateModels(subdomain);

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
