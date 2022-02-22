import typeDefs from './graphql/typeDefs';
import resolvers from './graphql/resolvers';
import apiConnect from './apiCollections';

import { IFetchElkArgs } from '@erxes/api-utils/src/types';
import { initBroker } from './messageBroker';

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
  apolloServerContext: (context) => {},
  onServerInit: async (options) => {
    await apiConnect();

    initBroker(options.messageBrokerClient);

    debug = options.debug;
    graphqlPubsub = options.pubsubClient;
    es = options.elasticsearch;
  },
  meta: {
    logs: { providesActivityLog: false }
  }
};
