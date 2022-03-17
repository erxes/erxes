import typeDefs from './graphql/typeDefs';
import resolvers from './graphql/resolvers';
import apiConnect from './apiCollections';
import permissions from './permissions';
import { IFetchElkArgs } from '@erxes/api-utils/src/types';
import { initBroker } from './messageBroker';
import { models } from './connectionResolver';

export let graphqlPubsub;
export let mainDb;
export let serviceDiscovery;

export let es: {
  client;
  fetchElk(args: IFetchElkArgs): Promise<any>;
  getMappings(index: string): Promise<any>;
  getIndexPrefix(): string;
};

export let debug;

export default {
  name: 'clientportal',
  permissions,
  graphql: async (serviceDiscovery) => {
    return {
      typeDefs: await typeDefs(serviceDiscovery),
      resolvers,
    };
  },
  hasSubscriptions: false,
  segment: {},

  apolloServerContext: (context) => {
    const subdomain = 'os';

    context.subdomain = subdomain;
    context.models = models;

    return context;
  },
  onServerInit: async (options) => {
    await apiConnect();
    initBroker(options.messageBrokerClient);

    debug = options.debug;
    graphqlPubsub = options.pubsubClient;
    es = options.elasticsearch;
  },
};
