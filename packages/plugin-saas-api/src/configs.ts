import typeDefs from './graphql/typeDefs';
import resolvers from './graphql/resolvers';

import { initBroker } from './messageBroker';
import { getSubdomain } from '@erxes/api-utils/src/core';
import { generateModels } from './connectionResolver';
import { routeErrorHandling } from '@erxes/api-utils/src/requests';
import app from '@erxes/api-utils/src/app';

export let mainDb;
export let debug;

export default {
  name: 'saas',
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

  onServerInit: async (options) => {
    mainDb = options.db;

    app.post(
      '/saas',
      routeErrorHandling(async (_req, res) => {
        res.json({ success: '200' });
      }),
    );

    initBroker();

    debug = options.debug;
  },
};
