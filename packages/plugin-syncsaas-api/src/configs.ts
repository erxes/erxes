import resolvers from './graphql/resolvers';
import typeDefs from './graphql/typeDefs';

import { getSubdomain } from '@erxes/api-utils/src/core';
import { generateModels } from './connectionResolver';
import { initBroker } from './messageBroker';
import { postHandler } from './postHandler';

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

  meta: {},
  postHandlers: [{ path: `/handleSync`, method: postHandler }],

  onServerInit: async (options) => {
    initBroker();
  },
};
