import resolvers from './graphql/resolvers';
import typeDefs from './graphql/typeDefs';

import { getSubdomain } from '@erxes/api-utils/src/core';
import { generateModels } from './connectionResolver';
import { initBroker } from './messageBroker';
import afterMutations from './afterMutations';
import { postHandler } from './postHandler';

export let mainDb;
export let debug;
export let serviceDiscovery;

export default {
  name: 'syncsaas',
  graphql: async sd => {
    serviceDiscovery = sd;

    return {
      typeDefs: await typeDefs(sd),
      resolvers: await resolvers(sd),
    };
  },
  apolloServerContext: async (context, req) => {
    const subdomain = getSubdomain(req);
    const models = await generateModels(subdomain);

    context.subdomain = req.hostname;
    context.models = models;

    return context;
  },

  meta: {
    afterMutations
  },
  postHandlers: [{ path: `/handleSync`, method: postHandler }],

  onServerInit: async options => {
    mainDb = options.db;

    initBroker(options.messageBrokerClient);

    debug = options.debug;
  }
};
