import typeDefs from './graphql/typeDefs';
import resolvers from './graphql/resolvers';
import { initBroker } from './messageBroker';
import { getSubdomain } from '@erxes/api-utils/src/core';

export let mainDb;
export let debug;

export default {
  name: 'dailyco',
  graphql: async () => {
    return {
      typeDefs: await typeDefs(),
      resolvers,
    };
  },
  apolloServerContext: async (context, req): Promise<any> => {
    const subdomain: string = getSubdomain(req);
    context.subdomain = subdomain;
    return context;
  },

  onServerInit: async (options) => {
    mainDb = options.db;

    debug = options.debug;

    initBroker(options.messageBrokerClient);
  },
};
