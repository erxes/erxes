import * as serverTiming from 'server-timing';
import typeDefs from './graphql/typeDefs';
import resolvers from './graphql/resolvers';

import { IFetchElkArgs } from '@erxes/api-utils/src/types';
import { initBroker } from './messageBroker';
import { generateModels } from './connectionResolver';
import permissions from './permissions';

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
  permissions,
  graphql: async (sd) => {
    serviceDiscovery = sd;

    return {
      typeDefs: await typeDefs(sd),
      resolvers,
    }
  },
  hasSubscriptions: false,
  segment: {},
  apolloServerContext: async (context, req, res) => {
    const subdomain = 'os';

    context.models = await generateModels(subdomain);
    context.subdomain = subdomain;

    context.serverTiming = {
      startTime: res.startTime,
      endTime: res.endTime,
      setMetric: res.setMetric
    }

    return context;
  },
  middlewares: [serverTiming],
  onServerInit: async (options) => {
    mainDb = options.db;

    initBroker(options.messageBrokerClient);

    debug = options.debug;
    graphqlPubsub = options.pubsubClient;
    es = options.elasticsearch;
  },
};
