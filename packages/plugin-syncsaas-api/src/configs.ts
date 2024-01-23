import resolvers from './graphql/resolvers';
import typeDefs from './graphql/typeDefs';

import { getSubdomain } from '@erxes/api-utils/src/core';
import { generateModels } from './connectionResolver';
import { initBroker } from './messageBroker';
import afterMutations from './afterMutations';
import { postHandler } from './postHandler';

export let mainDb;
export let debug;

export default {
  name: 'syncsaas',
  graphql: async () => {
    return {
      typeDefs: await typeDefs(),
      resolvers: await resolvers(),
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

    initBroker();

    debug = options.debug;
  }
};
