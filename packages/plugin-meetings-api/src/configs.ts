import typeDefs from './graphql/typeDefs';
import resolvers from './graphql/resolvers';
import { getSubdomain } from '@erxes/api-utils/src/core';
import { initBroker } from './messageBroker';
import { generateModels } from './connectionResolver';

export let mainDb;
export let debug;

export default {
  name: 'meetings',
  graphql: async () => {
    return {
      typeDefs: await typeDefs(),
      resolvers: await resolvers(),
    };
  },

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
  },
};
