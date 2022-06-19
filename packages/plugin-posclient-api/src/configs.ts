import typeDefs from './graphql/typeDefs';
import resolvers from './graphql/resolvers';
import { generateModels } from './connectionResolver';
import { initBroker } from './messageBroker';
import { initMemoryStorage } from './inmemoryStorage';
import { getSubdomain } from '@erxes/api-utils/src/core';
import { posInitialSetup } from './routes';

export let debug;
export let graphqlPubsub;
export let mainDb;
export let serviceDiscovery;

export default {
  name: 'posclient',
  graphql: async sd => {
    serviceDiscovery = sd;

    return {
      typeDefs: await typeDefs(),
      resolvers
    };
  },
  getHandlers: [{ path: `/initial-setup`, method: posInitialSetup }],
  postHandlers: [{ path: `/initial-setup`, method: posInitialSetup }],

  apolloServerContext: async (context, req) => {
    const subdomain = getSubdomain(req);

    context.subdomain = subdomain;
    context.models = await generateModels(subdomain);

    return context;
  },

  onServerInit: async options => {
    mainDb = options.db;

    initBroker();

    initMemoryStorage();

    debug = options.debug;
    graphqlPubsub = options.pubsubClient;
  },
  meta: {}
};
