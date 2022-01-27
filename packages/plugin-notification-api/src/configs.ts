import typeDefs from './graphql/typeDefs';
import resolvers from './graphql/resolvers';
import apiConnect from './apiCollections';

import { IFetchElkArgs } from '@erxes/api-utils/src/types';

export let graphqlPubsub;

export let es: {
  client;
  fetchElk(args: IFetchElkArgs): Promise<any>;
  getMappings(index: string): Promise<any>;
  getIndexPrefix(): string;
};

export let debug;

export default {
  name: 'notification',
  graphql: {
    typeDefs,
    resolvers,
  },
  hasSubscriptions: false,
  segment: {},
  apolloServerContext: (context) => {},
  onServerInit: async (options) => {
    await apiConnect();

    debug = options.debug;
    graphqlPubsub = options.pubsubClient;
    es = options.elasticsearch;
  },
};
