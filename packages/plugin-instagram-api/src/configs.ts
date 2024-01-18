import typeDefs from './graphql/typeDefs';
import resolvers from './graphql/resolvers';

import { initBroker } from './messageBroker';
import { getSubdomain } from '@erxes/api-utils/src/core';
import { generateModels } from './connectionResolver';
import initApp from './initApp';
import { INTEGRATION_KINDS } from './constants';

export let mainDb;
export let debug;

export default {
  name: 'instagram',
  graphql: async () => {
    return {
      typeDefs: await typeDefs(),
      resolvers: await resolvers(),
    };
  },
  meta: {
    inboxIntegrations: [
      {
        kind: INTEGRATION_KINDS.MESSENGER,
        label: 'Instagram messenger',
      },
    ],
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

    initBroker(options.messageBrokerClient);

    initApp();

    debug = options.debug;
  },
};
